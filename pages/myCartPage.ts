import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './basePage';
import { DataUtils } from '../utils/utilities';
import { ProductData } from '../data-objects/productData';
import { Logger } from '../utils/logger';

export class MyCartPage extends BasePage {
    private readonly selectedProductsTable: Locator;
    private readonly formProcessingFrame: Locator;
    // Dynamic locators to loop elements
    private readonly dynamicProductTitleLink: Locator;
    private readonly dynamicProductPriceText: Locator;
    private readonly dynamicProductSubTotalText: Locator;
    private readonly dynamicRemoveProductLink: Locator;
    private readonly dynamicProductQuantityTextbox: Locator;
    private readonly dynamicDecreaseProductQuantityBtn: Locator;
    private readonly dynamicIncreaseProductQuantityBtn: Locator;

    // Exact element located by product name
    private readonly productRowByProductName: (productName: string) => Locator;
    private readonly removeProductLinkByProductName: (productName: string) => Locator;
    private readonly productQuantityTextBoxByProductName: (productName: string) => Locator;
    private readonly decreaseProductQuantityBtnByProductName: (productName: string) => Locator;
    private readonly increaseProductQuantityBtnByProductName: (productName: string) => Locator;
    private readonly subTotalTextOfProductByProductName: (productName: string) => Locator;

    // General elements
    private readonly cartSubTotalPriceText: Locator;
    private readonly cartTotalPriceText: Locator;
    private readonly proceedToCheckoutButton: Locator;

    private readonly cartIsEmptyHeaderText: Locator;
    private readonly cartIsEmptyMessageText: Locator;
    private readonly returnToShopButton: Locator;

    constructor(page: Page) {
        super(page);
        this.selectedProductsTable = page.locator("form").locator('table');
        this.formProcessingFrame = page.locator("form.woocommerce-cart-form.processing");

        // Dynamic locators to loop elements
        this.proceedToCheckoutButton = page.getByRole('link', { name: 'Proceed to checkout' });
        this.dynamicProductTitleLink = page.locator('form').locator('td.product-details').locator('a.product-title');
        this.dynamicProductPriceText = page.locator('form').locator('td.product-price').locator('bdi');
        this.dynamicProductSubTotalText = page.locator("form").locator("td.product-subtotal").locator("bdi");
        this.dynamicProductQuantityTextbox = page.locator('form').locator('td.product-quantity').locator('input');
        this.dynamicDecreaseProductQuantityBtn = page.locator("form").locator("td.product-quantity").locator("span.minus");
        this.dynamicIncreaseProductQuantityBtn = page.locator("form").locator("td.product-quantity").locator("span.plus");

        // Exact element located by product name
        this.productRowByProductName = (_productName: string): Locator => page.locator("form").locator(`tr:has(td.product-details a.product-title:has-text('${_productName}'))`);
        this.removeProductLinkByProductName = (_productName: string): Locator => this.productRowByProductName(_productName).locator('a.remove-item');
        this.productQuantityTextBoxByProductName = (_productName: string): Locator => this.productRowByProductName(_productName).locator('input.input-text.qty');
        this.decreaseProductQuantityBtnByProductName = (_productName: string): Locator => this.productRowByProductName(_productName).locator('span.minus');
        this.increaseProductQuantityBtnByProductName = (_productName: string): Locator => this.productRowByProductName(_productName).locator('span.plus');
        this.subTotalTextOfProductByProductName = (_productName: string): Locator => this.productRowByProductName(_productName).locator('td.product-subtotal bdi');

        // General elements
        this.cartSubTotalPriceText = page.locator('div.cart_totals').locator("td[data-title='Subtotal']").locator('bdi');
        this.cartTotalPriceText = page.locator('div.cart_totals').locator("td[data-title='Total']").locator('bdi');
        this.dynamicRemoveProductLink = page.locator('form tr:has(td.product-details a.product-title) a.remove-item');
        this.cartIsEmptyHeaderText = page.getByRole('heading', { name: "YOUR SHOPPING CART IS EMPTY" });
        this.cartIsEmptyMessageText = page.getByText("We invite you to get acquainted with an assortment of our shop. Surely you can find something for yourself!");
        this.returnToShopButton = page.getByRole("link", { name: "RETURN TO SHOP" });
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

    async verifyCartContainsProducts(expectedProducts: Record<string, ProductData>,
        verifyProductCount: boolean = true): Promise<void> {
        for (const [productTitle, productData] of Object.entries(expectedProducts)) {
            let foundProduct = false;

            const _allTitlesLink: Array<Locator> = await this.dynamicProductTitleLink.all();
            const _allPricesText: Array<Locator> = await this.dynamicProductPriceText.all();
            const _allQuantityTxtBox: Array<Locator> = await this.dynamicProductQuantityTextbox.all();
            if (verifyProductCount) {
                expect(_allTitlesLink.length).toStrictEqual(Object.keys(expectedProducts).length);
                expect(_allTitlesLink.length).toStrictEqual(_allPricesText.length);
                expect(_allTitlesLink.length).toStrictEqual(_allQuantityTxtBox.length);
            }
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

            foundProduct ? Logger.info(`verifyCartContainsProducts(): The product [${productTitle} - ${productData.priceAsString} - Quantity: ${productData.quantity}] is in the cart!`) : Logger.info(`verifyCartContainsProducts(): The product [${productTitle} - ${productData.priceAsString} - Quantity: ${productData.quantity}] is NOT in the cart!`)
            expect(foundProduct).toStrictEqual(true);
        }
    }

    async getSubtotalPriceOfCart(): Promise<string> {
        await this.refreshPageTillElementVisible(this.cartSubTotalPriceText);
        return await this.cartSubTotalPriceText.textContent() ?? "not-found subtotal price of the cart text";
    }

    async getTotalPriceOfCart(): Promise<string> {
        await this.refreshPageTillElementVisible(this.cartTotalPriceText);
        return await this.cartTotalPriceText.textContent() ?? "not-found total price of the cart text";
    }

    async clickProceedToCheckout(): Promise<void> {
        await this.refreshPageTillElementVisible(this.proceedToCheckoutButton);
        await this.proceedToCheckoutButton.click();
    }

    async waitForProductInfoToBeUpdated(): Promise<void> {
        await expect(this.formProcessingFrame).toBeVisible();
        await expect(this.formProcessingFrame).toBeHidden();
    }

    async getProductQuantityByName(productName: string): Promise<number> {
        return Number(await this.productQuantityTextBoxByProductName(productName).getAttribute('value'));
    }

    async getProductSubTotalPriceByName(productName: string): Promise<string> {
        return await this.subTotalTextOfProductByProductName(productName).textContent() ?? `undefined sub-total price for product [${productName}]`;
    }

    async changeProductQuantityTo(productData: ProductData, newQty: number, editUsingQtyTextbox: boolean = false): Promise<void> {
        await this.verifyCartContainsProducts({ [productData.title]: productData }, false);
        if (newQty < 0) {
            throw new Error(`[ERROR] Invalid new quantity to set: ${newQty}!!!`);
        }
        if (newQty === productData.quantity) {
            Logger.warn(`editProductQuantity method: the new quantity is the same as the current quantity! Won't perform anything!`);
            return;
        }
        if (newQty === 0) {
            Logger.info(`changeProductQuantityTo(): Will remove the product from the cart as the new quantity is set to 0!!`);
            await this.removeProductLinkByProductName(productData.title).click();
            await expect(this.productRowByProductName(productData.title)).toBeHidden({ timeout: 10000 });
            productData.quantity = newQty;
            return;
        }

        Logger.info(`changeProductQuantityTo(): Current quantity of the product [${productData.title} - ${productData.priceAsString}]: ${productData.quantity}`);
        if (editUsingQtyTextbox) {
            const _editQtyTxtBox = this.productQuantityTextBoxByProductName(productData.title);
            _editQtyTxtBox.clear();
            _editQtyTxtBox.fill(newQty.toString());
            _editQtyTxtBox.press('Enter');
            await this.waitForProductInfoToBeUpdated();
        } else {
            for (let count = 0; count < Math.abs(newQty - productData.quantity); count++) {
                if (newQty > productData.quantity) {
                    await this.increaseProductQuantityBtnByProductName(productData.title).click();
                } else {
                    await this.decreaseProductQuantityBtnByProductName(productData.title).click();
                }
                await this.waitForProductInfoToBeUpdated();
            }
        }
        productData.quantity = newQty;
        Logger.info(`changeProductQuantityTo(): New quantity of the product [${productData.title} - ${productData.priceAsString}]: ${productData.quantity}\n`);
    }

    async verifyProductDataAndSubtotalPriceOfCart(productData: ProductData, orderedProductsData: Record<string, ProductData>): Promise<void> {
        await expect(this.productRowByProductName(productData.title)).toBeVisible();
        await expect(await this.getProductQuantityByName(productData.title)).toStrictEqual(productData.quantity);
        await expect(await this.getProductSubTotalPriceByName(productData.title)).toStrictEqual(productData.totalCostAsString);
        await expect(await this.getSubtotalPriceOfCart()).toStrictEqual(DataUtils.getTotalCostOfOrderedProductsAsPriceString(orderedProductsData));
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
                Logger.info("emptyShoppingCart(): Exceeded 2 minutes (Max allowed time for the Empty shopping cart action)!!!\nStop the action!!!");
                break;
            }
        }
    }

    async verifyCartIsEmpty(): Promise<void> {
        await expect(this.selectedProductsTable).toBeHidden();
        await expect(this.cartIsEmptyHeaderText).toBeVisible();
        await expect(this.cartIsEmptyMessageText).toBeVisible();
        await expect(this.returnToShopButton).toBeVisible();
    }

}
