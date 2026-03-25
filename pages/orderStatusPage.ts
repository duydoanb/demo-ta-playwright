import { expect } from '@playwright/test';
import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';
import { BillingInfo } from '../data-objects/billingInfo';
import { ProductData } from '../data-objects/productData';
import { Logger } from '../utils/logger';

export class OrderStatusPage extends BasePage {
    private readonly thankYouText: Locator;
    private readonly overViewPanelOrderNumberText: Locator;
    private readonly overViewPanelEmailText: Locator;
    private readonly overViewPanelTotalText: Locator;
    private readonly overViewPanelPaymentMethodText: Locator;

    private readonly dynamicProductNameWithQty: Locator;
    private readonly dynamicProductTotalCost: Locator;

    private readonly billingAddressHeader: Locator;
    private readonly billingAddressFrame: Locator;

    constructor(page: Page) {
        super(page);
        this.thankYouText = page.getByText("Thank you. Your order has been received.");
        this.overViewPanelOrderNumberText = page.getByRole('listitem').filter({ hasText: /Order number:/ }).getByRole("strong");
        this.overViewPanelEmailText = page.getByRole('listitem').filter({ hasText: /Email:/ }).getByRole("strong");
        this.overViewPanelTotalText = page.getByRole('listitem').filter({ hasText: /Total:/ }).getByRole("strong");
        this.overViewPanelPaymentMethodText = page.getByRole('listitem').filter({ hasText: /Payment method:/ }).getByRole("strong");

        this.dynamicProductNameWithQty = page.locator("td.product-name");
        this.dynamicProductTotalCost = page.locator('td.product-total').locator("bdi");

        this.billingAddressHeader = page.getByRole('heading', { level: 2, name: "Billing Address" });
        this.billingAddressFrame = this.billingAddressHeader.locator('xpath=/..//address');
    }

    async extractOrderId(): Promise<string> {
        const id = await this.overViewPanelOrderNumberText.textContent() ?? "undefine order id";
        Logger.info(`extractOrderId(): order id is ${id}  <<<<<`);
        return id;
    }

    async verifyGeneralInfoIsCorrect(billingInfo: BillingInfo, totalOrderCost: string, isGuest: boolean = false): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await expect(this.page).toHaveURL(/.*checkout\/order-received/i, { timeout: 15000 });
        const match = await this.page.url().match(/order-received\/(\d+)/);
        const actualOrderNumber = match ? match[1] : null;
        await expect(await this.overViewPanelOrderNumberText.textContent()).toStrictEqual(actualOrderNumber);
        await expect(this.thankYouText).toBeVisible();
        if (!isGuest) {
            await expect(this.overViewPanelEmailText).toHaveText(billingInfo.email);
        }
        await expect(this.overViewPanelTotalText).toHaveText(totalOrderCost);
        await expect(this.overViewPanelPaymentMethodText).toHaveText(billingInfo.paymentMethod.getFullName());
        Logger.info(`verifyGeneralInfoIsCorrect(): PASSED - General info of the order #${actualOrderNumber} is correct!`);
    }

    async verifyOrderDetailsTableIsCorrect(orderedProductsData: Record<string, ProductData>): Promise<void> {
        for (const [productName, productData] of Object.entries(orderedProductsData)) {
            let foundProduct = false;
            const _allProductNameWithQtyTexts = await this.dynamicProductNameWithQty.all();
            const _allProductTotalCostTexts = await this.dynamicProductTotalCost.all();

            expect(_allProductNameWithQtyTexts.length).toStrictEqual(Object.keys(orderedProductsData).length);
            expect(_allProductTotalCostTexts.length).toStrictEqual(Object.keys(orderedProductsData).length);

            for (let index = 0; index < _allProductNameWithQtyTexts.length; index++) {
                const _currentProductNameWithQty = await _allProductNameWithQtyTexts[index].innerText();
                const _currentProductTotalCost = await _allProductTotalCostTexts[index].textContent();
                if (_currentProductNameWithQty.replace('\u00A0', ' ') === `${productData.title} × ${productData.quantity}`
                    && _currentProductTotalCost === productData.totalCostAsString) {
                    foundProduct = true;
                    break;
                }
            }
            foundProduct ? Logger.info(`verifyOrderDetailsTableIsCorrect(): The product [${productData.title} x ${productData.quantity} - ${productData.totalCostAsString}] is in the order summary table!`) : Logger.error(`verifyOrderDetailsTableIsCorrect(): The product [${productData.title} x ${productData.quantity} - ${productData.totalCostAsString}] is NOT in the order summary table!`)
            expect(foundProduct).toStrictEqual(true);
        }
        Logger.info(`verifyOrderDetailsTableIsCorrect(): PASSED - All items in the order confirmed page are correct!`)
    }

    async verifyBillingAddressContentIsCorrect(billingInfo: BillingInfo, isGuest: boolean = false): Promise<void> {
        if (isGuest) {
            await expect(this.billingAddressHeader).toBeHidden();
            await expect(this.billingAddressFrame).toBeHidden();
            Logger.info("verifyBillingAddressContentIsCorrect(): PASSED - Customer billing info is not available as expected!");
        } else {
            await expect(this.billingAddressHeader).toBeVisible();
            await expect(this.billingAddressFrame).toBeVisible();

            let actualBillingDataTextsAsArray = await this.billingAddressFrame.allInnerTexts();
            // Process again to remove all empty lines
            actualBillingDataTextsAsArray = actualBillingDataTextsAsArray.toString().split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
            // Logger.info(`verifyBillingAddressContentIsCorrect(): Actual billing address data is:\n${allInnerTextsAsArray.join("\n")}\n`);

            if (billingInfo.country === "Hungary" || billingInfo.country === 'HU') {
                await expect(actualBillingDataTextsAsArray).toContain(`${billingInfo.lastName} ${billingInfo.firstName}`);
            } else {
                await expect(actualBillingDataTextsAsArray).toContain(`${billingInfo.firstName} ${billingInfo.lastName}`);
            }

            await expect(actualBillingDataTextsAsArray).toContain(billingInfo.companyName);
            await expect(actualBillingDataTextsAsArray).toContain(billingInfo.address1);
            await expect(actualBillingDataTextsAsArray.toString()).toContain(billingInfo.city);
            await expect(actualBillingDataTextsAsArray).toContain(billingInfo.phoneNumber);
            await expect(actualBillingDataTextsAsArray).toContain(billingInfo.email);

            // 2nd address and statecode checks if possible
            if (await ['Hungary', 'Thailand', 'United States (US)'].includes(billingInfo.country)) {
                await expect(actualBillingDataTextsAsArray.toString()).toContain(billingInfo.address2);
                await expect(actualBillingDataTextsAsArray.toString()).toContain(billingInfo.postalCode);
            }

            // If not US (AUT does not display US as country in billing address)
            if (billingInfo.country !== "United States (US)" && billingInfo.country !== "US") {
                await expect(actualBillingDataTextsAsArray).toContain(billingInfo.country);
            } else {
                await expect(actualBillingDataTextsAsArray.toString()).toContain(billingInfo.stateCode);
            }
            Logger.info("verifyBillingAddressContentIsCorrect(): PASSED - Customer billing info is correct!");
        }
    }

    async verifyOrderIsConfirmed(billingInfo: BillingInfo, totalOrderCost: string,
        orderedProductsData: Record<string, ProductData>, isGuest: boolean = false): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        // Assert the overview frame content
        await this.verifyGeneralInfoIsCorrect(billingInfo, totalOrderCost, isGuest);
        // Assert the order details table content
        await this.verifyOrderDetailsTableIsCorrect(orderedProductsData);
        // Assert the Billing address frame content
        await this.verifyBillingAddressContentIsCorrect(billingInfo, isGuest);
        Logger.info("verifyOrderIsConfirmed(): PASSED - The order is confirmed!");
    }
}
