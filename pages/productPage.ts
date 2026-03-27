import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './basePage';
import { ProductShowLimit, ProductSortMode, ProductViewMode } from '../data-objects/dataEnums';
import { DataUtils } from '../utils/utilities';
import { Logger } from '../utils/logger';

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
    private readonly dynamicProductCard: Locator;
    private readonly productThumbnailByIndex: (index: number | string) => Locator;
    private readonly openDetailsPageThumbnailByProductIndex: (index: number | string) => Locator;
    private readonly addToCartThumbnailByProductIndex: (index: number | string) => Locator;
    private readonly addToWishListThumbnailByProductIndex: (index: number | string) => Locator;


    constructor(page: Page) {
        super(page);
        this.gridViewModeButton = page.locator('div.switch-grid');
        this.productGridModeContainerFrame = page.locator('div.switch-grid.switcher-active');
        this.listViewModeButton = page.locator('div.switch-list');
        this.productListModeContainerFrame = page.locator('div.switch-list.switcher-active');

        this.sortingModeDropdown = page.getByRole('combobox', { name: 'Shop order' });
        this.productShowLimitDropdown = page.locator('div.products-per-page').getByRole('combobox');
        this.productsResultsLoadingSpinner = page.locator("div.et-loader.product-ajax.loading");

        this.dynamicProductTitleLink = page.locator("h2.product-title").locator('a');
        this.dynamicAddToCartButton = page.locator("div.text-center.product-details").getByRole('link', { name: /Add (.*) to your cart/ })
        this.dynamicProductCurrentPriceText = page.locator("div.product-details").locator("span.price > :is(span, ins)").locator("bdi");
        this.dynamicAddingProductAnimationFrame = page.locator("div.content-product.adding-to-cart");
        this.productPriceField = page.locator("div.content-product").locator("span.price");
        this.dynamicProductCard = page.locator("div.content-product");
        this.productThumbnailByIndex = (_index: number | string): Locator => this.dynamicProductCard.nth(DataUtils.convertToNumber(_index)).locator("div.product-image-wrapper");
        this.openDetailsPageThumbnailByProductIndex = (_index: number | string): Locator => this.productThumbnailByIndex(_index).locator("span.show-quickly");
        this.addToCartThumbnailByProductIndex = (_index: number | string): Locator => this.productThumbnailByIndex(_index).locator("a.add_to_cart_button");
        this.addToWishListThumbnailByProductIndex = (_index: number | string): Locator => this.productThumbnailByIndex(_index).locator("a.add_to_wishlist");
    }

    async waitForProductsResultsToLoad(timeout: number = 10000): Promise<void> {
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
        Logger.info(`clickAddToCartForProductNo(): Adding the product number #${productNumber} - ${await this.getTitleOfProductNo(productNumber)} to cart!`);
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
        Logger.info(`getAllDisplayedProductsOriginalPrices(): All displayed products original prices: ${prices.join(', ')}`);
        return prices;
    }

    async getTotalProductCountInPage(): Promise<number> {
        await this.waitForProductsResultsToLoad();
        const links = this.dynamicProductTitleLink;
        const _productsCount = await links.count();
        if (_productsCount === 0) {
            throw new Error('No products found to click');
        }
        return _productsCount;
    }

    async openRandomProductDetailsPage(): Promise<{ name: string; slug: string }> {
        const link = await this.dynamicProductTitleLink.nth(DataUtils.getRandomInt(0, await this.getTotalProductCountInPage() - 1));
        await expect(link).toBeVisible();
        await link.scrollIntoViewIfNeeded();

        const name = (await link.textContent())?.trim() ?? 'undefined product name';
        const href = (await link.getAttribute('href')) ?? 'undefined product link';

        await link.click();
        const parts = href.split('/').filter(p => p.length > 0);
        const slug = parts.length > 0 ? parts.pop() as string : '';

        await this.page.waitForURL(`**/${slug}/**`);
        await expect(this.page.locator('h1, h2').first()).toContainText(name);
        Logger.info(`openRandomProductDetailsPage(): Opened the details page of the product [${name}]`)
        return { name, slug };
    }

    async verifyProductActionThumbnailsAndTheirPurpose(productIndex: number): Promise<void> {
        const details = this.openDetailsPageThumbnailByProductIndex(productIndex);
        const addToCart = this.addToCartThumbnailByProductIndex(productIndex);
        const addToWishlist = this.addToWishListThumbnailByProductIndex(productIndex);
        await addToWishlist.scrollIntoViewIfNeeded();
        await this.scrollByAmount(100);

        await details.hover();
        await expect(details).toBeVisible();
        // await expect(details).toHaveAttribute("href", /\/product\//);

        await addToCart.hover();
        await expect(addToCart).toBeVisible();
        await expect(addToCart).toHaveAttribute("href", /add-to-cart=/);

        await addToWishlist.hover();
        await expect(addToWishlist).toBeVisible();
        await expect(addToWishlist).toHaveAttribute("href", /add_to_wishlist=/);
        Logger.info(`verifyProductActionThumbnailsAndTheirPurpose(): PASSED - All 3 action thumbnails of the product [${await this.getTitleOfProductNo(productIndex + 1)}] are visible`)
    }

    async verifyProductsHaveThreeActionThumbnailsAndCorrectPurposes(): Promise<void> {
        for (let idx = 0; idx < await this.dynamicProductCard.count(); idx++) {
            await this.verifyProductActionThumbnailsAndTheirPurpose(idx);
        }
    }

}
