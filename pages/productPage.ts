import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './basePage';
import { ProductShowLimit, ProductSortMode, ProductViewMode } from '../data-objects/dataEnums';
import { DataUtils } from '../utils/utilities';

export class ProductPage extends BasePage {
    private readonly gridViewModeButton: Locator;
    private readonly productGridModeContainerFrame: Locator;
    private readonly listViewModeButton: Locator;
    private readonly productListModeContainerFrame: Locator;
    private readonly sortingModeDropdown: Locator;
    private readonly productShowLimitDropdown: Locator;
    private readonly productsResultsLoadingSpinner: Locator;

    // Element in a single product frame
    private readonly dynamicProductTitleLink: Locator;
    private readonly dynamicProductCurrentPriceText: Locator;
    private readonly dynamicAddToCartButton: Locator;
    private readonly dynamicAddingProductAnimationFrame: Locator;

    // General locator that matches multiple elements
    private readonly productPriceField: Locator;

    constructor(page: Page) {
        super(page);
        this.gridViewModeButton = page.locator("xpath=//div[@class='view-switcher']/div[contains(@class,'grid')]");
        this.productGridModeContainerFrame = page.locator("xpath=//div[@data-row-count and contains(@class,'row products') and contains(@class,'grid')]");
        this.listViewModeButton = page.locator("xpath=//div[@class='view-switcher']/div[contains(@class,'list')]");
        this.productListModeContainerFrame = page.locator("xpath=//div[@data-row-count and contains(@class,'row products') and contains(@class,'list')]");
        this.sortingModeDropdown = page.getByRole('combobox', { name: 'Shop order' });
        this.productShowLimitDropdown = page.locator("xpath=//select[@name='et_per_page']");
        this.productsResultsLoadingSpinner = page.locator("xpath=//div[@class='et-loader product-ajax loading']");

        this.dynamicProductTitleLink = page.locator("xpath=(//div[@class='text-center product-details']/h2[@class='product-title']/a)");
        this.dynamicAddToCartButton = page.locator(`xpath=(//div[@class='text-center product-details']/a[contains(@href,'add-to-cart')])`);
        this.dynamicProductCurrentPriceText = page.locator("xpath=(//div[@class='text-center product-details']/span[@class='price']/*[local-name()='span' or local-name()='ins']//bdi)");
        this.dynamicAddingProductAnimationFrame = page.locator("xpath=//div[contains(@class,'content-product adding-to-cart')]");

        this.productPriceField = page.locator("xpath=//div[@class='content-product ']//span[@class='price']");
    }

    async waitForProductsResultsToLoad(timeout: number = 6000): Promise<void> {
        await this.productsResultsLoadingSpinner.waitFor({ state: 'detached', timeout: timeout });
    }

    async switchToProductViewMode(mode: ProductViewMode): Promise<void> {
        (mode === ProductViewMode.GRID) ? await this.gridViewModeButton.click() : await this.listViewModeButton.click();
        await this.waitForProductsResultsToLoad();
        await this.verifyProductViewModeSelected(mode);
    }

    async verifyProductViewModeSelected(mode: ProductViewMode): Promise<void> {
        await this.waitForProductsResultsToLoad();
        if (mode === ProductViewMode.GRID) {
            await expect(this.productGridModeContainerFrame).toBeVisible();
            await expect(this.productListModeContainerFrame).toBeHidden();
        } else {
            await expect(this.productGridModeContainerFrame).toBeHidden()
            await expect(this.productListModeContainerFrame).toBeVisible();
        }
    }

    async selectSortingMode(sortMode: ProductSortMode): Promise<void> {
        await this.sortingModeDropdown.selectOption({ label: sortMode.getFullName() });
        await this.waitForProductsResultsToLoad();
    }

    async setToShowProductsPerPage(limit: ProductShowLimit | string): Promise<void> {
        await this.productShowLimitDropdown.selectOption({ label: limit.toString() })
        await this.waitForProductsResultsToLoad();
    };

    async setToShowAllProductsPerPage(): Promise<void> {
        await this.setToShowProductsPerPage(ProductShowLimit.All);
    }

    async getTitleOfProductNo(productNumber: number | string): Promise<string> {
        const _productTitleLink = this.dynamicProductTitleLink.nth(DataUtils.convertToNumber(productNumber) - 1);
        await expect(_productTitleLink).toBeVisible();
        await _productTitleLink.scrollIntoViewIfNeeded();
        return await _productTitleLink.textContent() ?? "not-found product title";
    }

    async getCurrentPriceOfProductNo(productNumber: number | string): Promise<string> {
        const _productPriceTxt = this.dynamicProductCurrentPriceText.nth(DataUtils.convertToNumber(productNumber) - 1);
        await expect(_productPriceTxt).toBeVisible();
        await _productPriceTxt.scrollIntoViewIfNeeded();
        return await _productPriceTxt.textContent() ?? "not-found product current price text";
    }

    async clickAddToCartForProductNo(productNumber: number | string): Promise<void> {
        productNumber = DataUtils.convertToNumber(productNumber);
        console.log(`[INFO] clickAddToCartForProductNo(): Adding the product number #${productNumber} - ${await this.getTitleOfProductNo(productNumber)} to cart!`);
        const _addToCartBtn = this.dynamicAddToCartButton.nth(productNumber - 1);
        await expect(_addToCartBtn).toBeVisible({ timeout: 10000 });
        await _addToCartBtn.scrollIntoViewIfNeeded();
        await _addToCartBtn.click({ timeout: 10000 });
        await expect(this.dynamicAddingProductAnimationFrame).toBeHidden();
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
        console.log('[INFO] getAllDisplayedProductsOriginalPrices(): All displayed products original prices: ', prices.join(', '));
        return prices;
    }

}
