import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';
import { HomePage } from './homePage';
import { expect } from '../fixtures/beforeAndAfterTest';
import { ProductData } from '../data-objects/productData';
import { Logger } from '../utils/logger';

export class MyAccountPage extends BasePage {
    private readonly recentOrdersButton: Locator;
    private readonly addressesButton: Locator;
    private readonly accountDetailsButton: Locator;
    private readonly logoutButton: Locator;

    private readonly nextOrdersPageButton: Locator;
    private readonly previousOrdersPageButton: Locator;
    private readonly dynamicOrderIdInOrdersTable: Locator;

    // For Order details
    private readonly orderDetailsLinkByOrderId: (orderId: string) => Locator;
    private readonly dynamicProductNameWithQty: Locator;
    private readonly dynamicProductTotalCost: Locator;
    private readonly subtotalAmountOfOrderText: Locator;

    constructor(page: Page) {
        super(page);
        this.recentOrdersButton = page.getByRole('link', { name: /.*Recent orders/ });
        this.addressesButton = page.getByRole('link', { name: /.*Addresses/ });
        this.accountDetailsButton = page.getByRole('link', { name: /.*Account details/ });
        this.logoutButton = page.getByRole('link', { name: /.*Logout/ });

        this.nextOrdersPageButton = page.getByRole('link', { name: 'NEXT' });
        this.previousOrdersPageButton = page.getByRole('link', { name: 'PREVIOUS' });
        this.dynamicOrderIdInOrdersTable = page.locator("td[data-title='Order']").locator('a');
        this.orderDetailsLinkByOrderId = (_orderId: string): Locator => page.locator("td[data-title='Order']").locator(`a:has-text('${_orderId}')`);

        // For Order details
        this.dynamicProductNameWithQty = page.locator("td.product-name");
        this.dynamicProductTotalCost = page.locator("td.product-total").locator("bdi");
        this.subtotalAmountOfOrderText = page.locator("tr:has(th:has-text('Subtotal:'))").locator("span[class*='Price-amount amount']");
    }

    async logout(): Promise<void> {
        await this.logoutButton.click();
        await this.page.waitForLoadState('networkidle');
        await expect(await new HomePage(this.page).isLoginLinkVisible()).toStrictEqual(true);
    }

    async clickRecentOrdersButton(): Promise<void> {
        await this.recentOrdersButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async clickAddressesButton(): Promise<void> {
        await this.addressesButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async clickAccountDetailsButton(): Promise<void> {
        await this.accountDetailsButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async goToNextOrderRecordPage(): Promise<void> {
        await expect(this.nextOrdersPageButton).toBeEnabled();
        await expect(this.nextOrdersPageButton).toBeVisible();
        await this.nextOrdersPageButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async findAndViewOrderDetailsLinkByOrderId(orderId: string): Promise<void> {
        const maxPageCheckCount = 20;
        let checkCount = 0;
        Logger.info(`findAndViewOrderDetailsLinkByOrderId(): Opening the details page of order #${orderId}`);

        while (true) {
            if ((await this.getCurrentOrderIdsList()).includes(Number(orderId.replace(/[^0-9]/g, "")))) {
                Logger.info(`findAndViewOrderDetailsLinkByOrderId(): Found the order #${orderId}`);
                break;
            }
            if (await this.nextOrdersPageButton.isHidden()) {
                throw new Error(`[ERROR] findAndViewOrderDetailsLinkByOrderId(): Loop through all pages, the order #${orderId} does not exist!`)
            }
            if (checkCount >= maxPageCheckCount) {
                throw new Error(`[ERROR] findAndViewOrderDetailsLinkByOrderId(): Failed to find the order #${orderId} after ${maxPageCheckCount} tries!`)
            }
            await this.goToNextOrderRecordPage();
            checkCount++;
        }

        await this.orderDetailsLinkByOrderId(orderId).click();
        await this.page.waitForLoadState("networkidle");
    }

    async verifyOrderDetailsTableDataIsCorrect(orderedProductsData: Record<string, ProductData>): Promise<void> {
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
            foundProduct ? Logger.info(`verifyOrderDetailsTableDataIsCorrect(): The product [${productData.title} x ${productData.quantity} - ${productData.totalCostAsString}] is in the order details table!`) : Logger.error(`verifyOrderDetailsTableDataIsCorrect(): The product [${productData.title} x ${productData.quantity} - ${productData.totalCostAsString}] is NOT in the order details table!`)
            expect(foundProduct).toStrictEqual(true);
        }
    }

    async getOrderSubtotalPriceAsString(): Promise<string> {
        return await this.subtotalAmountOfOrderText.textContent() ?? "undefine subtotal price for the order!";
    }

    async goToTheLastPageOfMyOrders(maxPages: number = 50): Promise<void> {
        for (let i = 0; i < maxPages; i++) {
            if (await this.nextOrdersPageButton.isVisible()) {
                await this.nextOrdersPageButton.click();
                await this.page.waitForLoadState('domcontentloaded');
            } else {
                break;
            }
        }
    }

    async getCurrentOrderIdsList(): Promise<number[]> {
        const orderIds: number[] = [];
        for (const idCell of await this.dynamicOrderIdInOrdersTable.all()) {
            const tempOrderId: string | null = await idCell.textContent();
            if (tempOrderId) {
                orderIds.push(Number(tempOrderId.replace(/\D/g, '').trim()));
            }
        }
        return orderIds;
    }

    async extractAllOrderIdsFromTheFirstPage(): Promise<number[]> {
        const allOrderIds: number[] = [];
        let hasNextPage = true;
        const maxCheckCount = 20;
        let checkCount = 0;

        while (hasNextPage) {
            if (checkCount >= maxCheckCount) {
                break;
            }
            const currentPageOrderIds = await this.getCurrentOrderIdsList();
            allOrderIds.push(...currentPageOrderIds);
            if (await this.nextOrdersPageButton.isVisible()) {
                await this.nextOrdersPageButton.click();
                await this.page.waitForLoadState('domcontentloaded');
            } else {
                hasNextPage = false;
            }
            checkCount++;
        }
        Logger.info('extractAllOrderIdsFromTheFirstPage(): Actual order IDs (as numbers): ' + allOrderIds.join(', '));
        return allOrderIds;
    }

}
