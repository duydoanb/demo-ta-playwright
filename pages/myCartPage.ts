import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './basePage';
import { DataUtils } from '../utils/utilities';
import { ProductData } from '../data-objects/productData';

export class MyCartPage extends BasePage {
    private readonly dynamicProductTitleLink: Locator;
    private readonly dynamicProductPriceText: Locator;
    private readonly dynamicRemoveProductLink: Locator;
    private readonly dynamicProductQuantityTextbox: Locator;
    private readonly dynamicDecreaseProductQuantityBtn: Locator;
    private readonly dynamicIncreaseProductQuantityBtn: Locator;

    private readonly totalPriceText: Locator;
    private readonly proceedToCheckoutButton: Locator;

    constructor(page: Page) {
        super(page);
        this.proceedToCheckoutButton = page.getByRole('link', { name: 'Proceed to checkout' });
        this.dynamicProductTitleLink = page.locator("xpath=//div[@class='table-responsive']//tbody/tr/td[@class='product-details']//a[@class='product-title']");
        this.dynamicProductPriceText = page.locator("xpath=//div[@class='table-responsive']//tbody/tr/td[@class='product-price']//bdi");
        this.dynamicProductQuantityTextbox = page.locator("xpath=//div[@class='table-responsive']//tbody/tr/td[@class='product-quantity']//input");
        this.dynamicDecreaseProductQuantityBtn = page.locator("xpath=//div[@class='table-responsive']//tbody/tr/td[@class='product-quantity']//span[@class='minus']");
        this.dynamicIncreaseProductQuantityBtn = page.locator("xpath=//div[@class='table-responsive']//tbody/tr/td[@class='product-quantity']//span[@class='plus']");

        this.totalPriceText = page.locator("xpath=//td[@data-title='Total']//bdi");
        this.dynamicRemoveProductLink = page.locator("xpath=//div[@class='table-responsive']//tbody/tr/td[@class='product-details']//a[@title='Remove this item']");
    }

    private async refreshPageTillElementVisible(elementLocator: Locator, maxTries: number = 4, expectElementVisible: boolean = true): Promise<void> {
        for (let i = 0; i < maxTries; i++) {
            if (!await elementLocator.isVisible()) {
                await this.page.reload();
            } else {
                break;
            }
        }
        if (expectElementVisible) {
            await expect(elementLocator).toBeVisible();
        }
    }

    async getTitleOfProductNo(productNo: number | string): Promise<string> {
        const _title = this.dynamicProductTitleLink.nth(DataUtils.convertToNumber(productNo) - 1);
        await this.refreshPageTillElementVisible(_title);
        await _title.scrollIntoViewIfNeeded();
        return await _title.textContent() ?? "not-found product title";
    }

    async getPriceOfProductNo(productNo: number | string): Promise<string> {
        const _price = this.dynamicProductPriceText.nth(DataUtils.convertToNumber(productNo) - 1);
        await this.refreshPageTillElementVisible(_price);
        await _price.scrollIntoViewIfNeeded();
        return await _price.textContent() ?? "not-found product price text";
    }

    async verifyCartContainsProductsNew(expectedProducts: Record<string, ProductData>): Promise<void> {
        for (const [productTitle, productData] of Object.entries(expectedProducts)) {
            let foundProduct = false;

            const _allTitlesLink: Array<Locator> = await this.dynamicProductTitleLink.all();
            const _allPricesText: Array<Locator> = await this.dynamicProductPriceText.all();
            const _allQuantityTxtBox: Array<Locator> = await this.dynamicProductQuantityTextbox.all();
            expect(_allTitlesLink.length).toStrictEqual(Object.keys(expectedProducts).length);
            expect(_allTitlesLink.length).toStrictEqual(_allPricesText.length);
            expect(_allTitlesLink.length).toStrictEqual(_allQuantityTxtBox.length);
            for (let index = 0; index < _allPricesText.length; index++) {
                const _currentTitle = await _allTitlesLink[index].textContent();
                const _currentPrice = await _allPricesText[index].textContent();
                const _currentQty = Number(await _allQuantityTxtBox[index].getAttribute('value'));
                if (_currentTitle === productTitle
                    && _currentPrice === productData.priceAsString
                    && _currentQty === productData.quantity) {
                    foundProduct = true;
                    break;
                }
            }

            foundProduct ? console.log(`The product [${productTitle} - ${productData.priceAsString} - Quantity: ${productData.quantity}] is in the cart!`) : console.log(`[ERROR] The product [${productTitle} - ${productData.priceAsString} - Quantity: ${productData.quantity}] is NOT in the cart!`)
            expect(foundProduct).toStrictEqual(true);
        }
    }

    async getTotalCartPrice(): Promise<string> {
        await this.refreshPageTillElementVisible(this.totalPriceText);
        return await this.totalPriceText.textContent() ?? "not-found total cart price text";
    }

    async clickProceedToCheckout(): Promise<void> {
        await this.refreshPageTillElementVisible(this.proceedToCheckoutButton);
        await this.proceedToCheckoutButton.click();
    }

    async emptyShoppingCart(): Promise<void> {
        const _firstRemoveProductLink = await this.dynamicRemoveProductLink.first();
        await this.refreshPageTillElementVisible(_firstRemoveProductLink, 1, false);

        let isRemoveProductLinkVisible = await _firstRemoveProductLink.isVisible();
        const startTimestampInSecs: number = Math.floor(Date.now() / 1000);

        while (isRemoveProductLinkVisible) {
            await _firstRemoveProductLink.click();
            await this.page.waitForLoadState('networkidle');
            isRemoveProductLinkVisible = await _firstRemoveProductLink.isVisible();
            // stop if current time is ahead of start time by 2 mins
            if (Math.floor(Date.now() / 1000) - startTimestampInSecs >= 2 * 60) {
                console.log("Exceeded 2 minutes (Max allowed time for the Empty shopping cart action)!!!\nStop the action!!!");
                break;
            }
        }
    }

}
