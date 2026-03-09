import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './basePage';
import { ProductSortMode } from '../data-objects/dataEnums';

export class ProductPage extends BasePage {
    private readonly gridViewModeButton: Locator;
    private readonly listViewModeButton: Locator;
    private readonly sortingModeDropdown: Locator;
    private readonly productShowLimitDropdown: Locator;
    private readonly productsResultsLoadingSpinner: Locator;
    private readonly dynamicAddToCartButton: Locator;
    private readonly productPriceField: Locator;

    constructor(page: Page) {
        super(page);
        this.gridViewModeButton = page.locator("//div[@class='view-switcher']/div[contains(@class,'grid')]");
        this.listViewModeButton = page.locator("//div[@class='view-switcher']/div[contains(@class,'list')]");
        this.sortingModeDropdown = page.getByRole('combobox', { name: 'Shop order' });
        this.productShowLimitDropdown = page.locator("//select[@name='et_per_page']");
        this.productsResultsLoadingSpinner = page.locator("//div[@class='et-loader product-ajax loading']");
        this.dynamicAddToCartButton = page.locator("xpath=//div[@class='text-center product-details']/a[contains(@href,'add-to-cart')]");
        this.productPriceField = page.locator("xpath=//div[@class='content-product ']//span[@class='price']");
    }

    async waitForProductsResultsToLoad(timeout: number = 6000): Promise<void> {
        await this.productsResultsLoadingSpinner.waitFor({ state: 'detached', timeout: timeout });
    }

    async switchToGridViewMode(): Promise<void> {
        await this.gridViewModeButton.click();
        await this.waitForProductsResultsToLoad();
    }

    async switchToListViewMode(): Promise<void> {
        await this.listViewModeButton.click();
        await this.waitForProductsResultsToLoad();
    }

    async selectSortingMode(sortMode: ProductSortMode): Promise<void> {
        await this.sortingModeDropdown.selectOption({ label: sortMode.getFullName() });
        await this.waitForProductsResultsToLoad();
    }

    async setToShowProductsPerPage(limit: string): Promise<void> {
        await this.productShowLimitDropdown.selectOption({ label: limit.toString() })
        await this.waitForProductsResultsToLoad();
    };

    async setToShowAllProductsPerPage(): Promise<void> {
        await this.setToShowProductsPerPage('All');
    }

    async clickAddToCartForProductNo(productNumber: number | string): Promise<void> {
        await this.switchToGridViewMode();
        
        if (typeof productNumber === 'string' ) {
            productNumber = Number(productNumber);
        }
        await this.dynamicAddToCartButton.nth(productNumber - 1).click({ timeout: 3000 });
        await this.waitForProductsResultsToLoad(1000);
    }

    async getProductOriginalPrice(productPriceLocator: Locator): Promise<number> {
        const text1 = await productPriceLocator.locator("xpath=.//ins//bdi");
        const text2 = await productPriceLocator.locator("xpath=.//bdi");
        var priceText;
        if (await text1.isVisible()) {
            priceText = await text1.first().textContent();
        } else {
            priceText = await text2.first().textContent();
        }
        await expect(priceText).not.toBeNull();
        return priceText ? parseFloat(priceText.replace(/[^\d.]/g, '')) : 0;
    }

    async getAllDisplayedProductsOriginalPrices(): Promise<number[]> {
        const prices: number[] = [];
        for (const priceLocator of await this.productPriceField.all()) {
            prices.push(await this.getProductOriginalPrice(priceLocator));
        }
        console.log('All displayed products original prices: ', prices.join(', '));
        return prices;
    }

}