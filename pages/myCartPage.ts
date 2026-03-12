import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './basePage';

export class MyCartPage extends BasePage {
    private readonly dynamicProductTitleLink: Locator;
    private readonly dynamicProductPriceText: Locator;
    private readonly dynamicRemoveProductLink: Locator;

    private readonly totalPriceText: Locator;
    private readonly proceedToCheckoutButton: Locator;

    constructor(page: Page) {
        super(page);
        this.proceedToCheckoutButton = page.getByRole('link', { name: 'Proceed to checkout' });
        this.dynamicProductTitleLink = page.locator("xpath=//div[@class='table-responsive']//tbody/tr/td[@class='product-details']//a[@class='product-title']");
        this.dynamicProductPriceText = page.locator("xpath=//div[@class='table-responsive']//tbody/tr/td[@class='product-price']//bdi");

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
        if (typeof productNo === 'string') {
            productNo = Number(productNo);
        }
        const _title = this.dynamicProductTitleLink.nth(productNo - 1);
        await this.refreshPageTillElementVisible(_title);
        await _title.scrollIntoViewIfNeeded();
        return await _title.textContent() ?? "not-found product title";
    }

    async getPriceOfProductNo(productNo: number | string): Promise<string> {
        if (typeof productNo === 'string') {
            productNo = Number(productNo);
        }
        const _price = this.dynamicProductPriceText.nth(productNo - 1);
        await this.refreshPageTillElementVisible(_price);
        await _price.scrollIntoViewIfNeeded();
        return await _price.textContent() ?? "not-found product price text";
    }

    async verifyCartContainsProducts(expectedProducts: Map<string, string>[]): Promise<void> {
        for (const _product of expectedProducts) {
            const expectedProductTitle = _product.get('title');
            const expectedProductPrice = _product.get('price');
            let foundProduct = false;

            const _allTitlesLink: Array<Locator> = await this.dynamicProductTitleLink.all();
            const _allPricesText: Array<Locator> = await this.dynamicProductPriceText.all();
            expect(_allPricesText.length).toStrictEqual(_allPricesText.length);
            for (let index = 0; index < _allPricesText.length; index++) {
                const _currentTitle = await _allTitlesLink[index].textContent();
                const _currentPrice = await _allPricesText[index].textContent();
                if (_currentTitle === expectedProductTitle && _currentPrice === expectedProductPrice) {
                    foundProduct = true;
                    break;
                }
            }

            foundProduct ? console.log(`The product [${expectedProductTitle} - ${expectedProductPrice}] is in the cart!`) : console.log(`The product [${expectedProductTitle} - ${expectedProductPrice}] is NOT in the cart!`)
            expect(foundProduct).toBeTruthy();
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
        let currentTimestampInSecs: number;

        while (isRemoveProductLinkVisible) {
            await _firstRemoveProductLink.click();
            await this.page.waitForLoadState('networkidle');
            isRemoveProductLinkVisible = await _firstRemoveProductLink.isVisible();
            currentTimestampInSecs = Math.floor(Date.now() / 1000);
            if (currentTimestampInSecs - startTimestampInSecs >= 2 * 60) {
                break;
            }
        }
    }

}
