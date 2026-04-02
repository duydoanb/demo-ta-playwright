import { promises as fs } from "fs";
import { lock } from "proper-lockfile";
import { Page } from "@playwright/test";
import { ProductData } from "../data-objects/productData";
import { HomePage } from "../pages/homePage";
import { BillingInfoEnum, CredentialUsageStatus, MenuTab } from "../data-objects/dataEnums";
import { ProductPage } from "../pages/productPage";
import { BillingInfo } from "../data-objects/billingInfo";
import { MyCartPage } from "../pages/myCartPage";
import { CheckoutPage } from "../pages/checkoutPage";
import { OrderStatusPage } from "../pages/orderStatusPage";
import { Constants } from "./constants";
import path from "path";
import { Logger } from "./logger";

const retryOptionsForFileLock = {
    retries: {
        retries: 10,            // Number of times to try before giving up
        factor: 2,              // Exponential backoff factor (wait 2x longer each time)
        minTimeout: 100,        // Minimum wait time (1 second)
        maxTimeout: 5000,       // Maximum wait time (10 seconds)
        randomize: true         // Adds "jitter" so processes don't all retry at the exact same millisecond
    }
};

const _sleepAction = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export async function sleep(timeoutInMicrosecs: number) {
    await _sleepAction(timeoutInMicrosecs);
}

export class DataUtils {

    static getCurrentLocalISOTimeStamp(returnRealISOFormat: boolean = true): string {
        const now = new Date();
        const offsetMinutes = -now.getTimezoneOffset(); // Invert to get real offset
        const absOffset = Math.abs(offsetMinutes);

        // Format the offset as +HHMM or -HHMM
        const sign = offsetMinutes >= 0 ? "+" : "-";
        const hours = Math.floor(absOffset / 60).toString().padStart(2, '0');
        const minutes = (absOffset % 60).toString().padStart(2, '0');
        const offsetStr = `${sign}${hours}${minutes}`;

        // Adjust date to local time for the ISO string base
        const tzOffsetMs = now.getTimezoneOffset() * 60000;
        const localISOTime = new Date(Date.now() - tzOffsetMs).toISOString();

        if (returnRealISOFormat) {
            // Result: 2026-03-27T14:19:39.308+0700
            return localISOTime.replace("Z", "") + offsetStr;
        } else {
            // Result: 2026-03-27T14-19-39
            return localISOTime.split('.')[0].replace(/:/g, '-');
        }
    }

    static generateUnixTimeStamp(setPrecisionToSecond: boolean = false): number {
        return setPrecisionToSecond ? Math.floor(Date.now() / 1000) : Date.now();
    }

    static getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static convertToNumber(stringOrNumber: number | string): number {
        if (typeof stringOrNumber === 'string') {
            stringOrNumber = Number(stringOrNumber);
        }
        return stringOrNumber;
    }

    static addProductDataIntoProductsDataRecord(currentProductsRecord: Record<string, ProductData>, productDataToAdd: ProductData, newQty?: number): void {
        const _productToAddTitle = productDataToAdd.title;
        if (currentProductsRecord[_productToAddTitle]) {
            currentProductsRecord[_productToAddTitle].quantity = newQty ?? currentProductsRecord[_productToAddTitle].quantity + 1;
        } else {
            currentProductsRecord[_productToAddTitle] = productDataToAdd;
        }
    }

    static getTotalCostOfOrderedProducts(currentProductsRecord: Record<string, ProductData>): number {
        let totalCost: number = 0;
        for (const [_productName, _productData] of Object.entries(currentProductsRecord)) {
            totalCost += _productData.totalCost;
        }
        return totalCost;
    }

    static getTotalCostOfOrderedProductsAsPriceString(currentProductsRecord: Record<string, ProductData>): string {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.getTotalCostOfOrderedProducts(currentProductsRecord));
    }
}

export class ActionUtils {

    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async completeAnOrderAndReturnOrderId(productsDataToSave: Record<string, ProductData>, noOfPurchaseProduct: number, billingInfo?: BillingInfo): Promise<string> {
        billingInfo = billingInfo ?? new BillingInfo(await BillingInfoEnum.US_ADDRESS_1.convertToRecordObject());
        const homePage = new HomePage(this.page);
        const productPage = new ProductPage(this.page);
        const myCartPage = new MyCartPage(this.page);
        const checkoutPage = new CheckoutPage(this.page);
        const orderStatusPage = new OrderStatusPage(this.page);
        let _productNo: number;

        // Product page
        await homePage.clickMenuTab(MenuTab.SHOP);
        // Add to cart
        for (let index = 0; index < Math.round(noOfPurchaseProduct); index++) {
            _productNo = DataUtils.getRandomInt(1, 10);
            await productPage.clickAddToCartForProductNo(_productNo);
            const _currentProductData = new ProductData({
                title: await productPage.getTitleOfProductNo(_productNo),
                priceString: await productPage.getCurrentPriceOfProductNo(_productNo),
                quantity: 1
            });
            DataUtils.addProductDataIntoProductsDataRecord(productsDataToSave, _currentProductData);
        }
        // Checkout
        await productPage.clickMyCartLink();
        await myCartPage.clickProceedToCheckout();
        // Place order
        await checkoutPage.fillBillingDetailsAndPlaceOrder(billingInfo);
        await orderStatusPage.verifyOrderIsConfirmed(billingInfo, DataUtils.getTotalCostOfOrderedProductsAsPriceString(productsDataToSave), productsDataToSave);
        return await orderStatusPage.extractOrderId();
    }

}

export class FileUtils {
    constructor() { }
    async ensureJsonFileExists(filePath: string): Promise<void> {
        try {
            // Check if the file is accessible
            await fs.access(filePath);
        } catch {
            // If access fails, the file likely doesn't exist; create it with an empty object
            await fs.writeFile(filePath, JSON.stringify({}, null, 2));
            Logger.info(`ensureJsonFileExists(): Created new file at: ${filePath}`);
        }
    }

    async getCredentialCreationTimeData(): Promise<Record<string, Record<string, string>>> {
        const _filePath = path.join(Constants.TEMP_STORAGE_STATE_AUTH_DATA_DIR_PATH, Constants.CREDENTIAL_CREATION_TIME_FILE_NAME);
        await this.ensureJsonFileExists(_filePath);
        const content = await fs.readFile(_filePath, 'utf8');
        const _creationTimeData: Record<string, Record<string, string>> = JSON.parse(content);
        return _creationTimeData;
    }

    async loadFreshContentToCredsUsageStatusFile(): Promise<void> {
        const filePath = path.join(Constants.TEMP_STORAGE_STATE_AUTH_DATA_DIR_PATH, Constants.CREDENTIAL_USAGE_STATUS_FILE_NAME);
        await fs.writeFile(filePath, JSON.stringify({}, null, 2));
        Logger.info(`loadFreshContentToCredsUsageStatusFile(): Cleared the old content of the file ${filePath}`);

        const credsUsageData: Record<string, Record<string, string>> = {};
        for (const cred of Constants.ALL_VALID_CREDENTIALS) {
            credsUsageData[cred.alias] = { 'status': CredentialUsageStatus.FREE.getFullName() }
        }
        try {
            const jsonString = JSON.stringify(credsUsageData, null, 2);
            await fs.writeFile(filePath, jsonString, 'utf8');
            Logger.info("loadFreshContentToCredsUsageStatusFile(): Credentials usage statuses are successfully saved!");
        } catch (error) {
            Logger.error(`loadFreshContentToCredsUsageStatusFile(): Error saving data: ${error}`);
        }
    }

    async getTempStorageStateJsonPath(userAliasToUse: string): Promise<string> {
        return path.join(Constants.TEMP_STORAGE_STATE_AUTH_DATA_DIR_PATH, `${userAliasToUse}.json`)
    }

    async getFreeCredentialToRunTest(): Promise<string> {
        const filePath: string = path.join(Constants.TEMP_STORAGE_STATE_AUTH_DATA_DIR_PATH, Constants.CREDENTIAL_USAGE_STATUS_FILE_NAME)
        const defautUser: string = "not-available";
        let returnUser: string = defautUser;


        const startTime: number = Math.floor(Date.now());
        let currentTime;
        const retryInterval = 500; // In ms
        const maxTryCount = (4 * 60 * 1000) / retryInterval;
        let warningMessToBeDisplayedAtSecondMark = 5;
        for (let tryCount = 0; tryCount < maxTryCount; tryCount++) {
            const release = await lock(filePath, retryOptionsForFileLock);
            try {
                const content = await fs.readFile(filePath, 'utf8');
                const usageData: Record<string, Record<string, string>> = JSON.parse(content);
                for (const [userNo, data] of Object.entries(usageData)) {
                    if (data.status === CredentialUsageStatus.FREE.getFullName()) {
                        Logger.info(`getFreeCredentialToRunTest(): ${userNo} is ready to use!`)
                        returnUser = userNo;
                        data.status = CredentialUsageStatus.LOCKED.getFullName();
                        break;
                    }
                }
                // Only re-write the file only if found a free cred
                if (returnUser !== defautUser) {
                    const updatedData = { ...usageData };
                    await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2));
                    Logger.info(`getFreeCredentialToRunTest(): The file ${Constants.CREDENTIAL_USAGE_STATUS_FILE_NAME} is updated safely!\n`);
                }
            } catch (error) {
                Logger.error(`getFreeCredentialToRunTest(): Failed to read and write data to file ${filePath}: ${error}`);
            } finally {
                await release();
            }

            if (returnUser !== defautUser) {
                break;
            } else {
                currentTime = Math.floor(Date.now());
                if ((currentTime - startTime) / 1000 > warningMessToBeDisplayedAtSecondMark) {
                    Logger.warn(`getFreeCredentialToRunTest(): Could not find a free credential to run test after ${(currentTime - startTime) / 1000} seconds!!!`);
                    warningMessToBeDisplayedAtSecondMark += 5;
                }
                await sleep(retryInterval);
            }
        }

        return returnUser;
    }

    async releaseBeingUsedCredential(userAlias: string): Promise<void> {
        const filePath: string = path.join(Constants.TEMP_STORAGE_STATE_AUTH_DATA_DIR_PATH, Constants.CREDENTIAL_USAGE_STATUS_FILE_NAME);
        const release = await lock(filePath, retryOptionsForFileLock);
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const usageData: Record<string, Record<string, string>> = JSON.parse(content);
            for (const [userNo, data] of Object.entries(usageData)) {
                if (userNo === userAlias) {
                    data.status = CredentialUsageStatus.FREE.getFullName();
                    Logger.info(`releaseBeingUsedCredential(): ${userNo} is freed!`)
                    break;
                }
            }
            await fs.writeFile(filePath, JSON.stringify({ ...usageData }, null, 2));
            Logger.info(`releaseBeingUsedCredential(): The file ${Constants.CREDENTIAL_USAGE_STATUS_FILE_NAME} is updated safely!\n`);
        } catch (error) {
            Logger.error(`releaseBeingUsedCredential(): Failed to read and write data to file ${filePath}: ${error}`);
        } finally {
            await release();
        }
    }

}
