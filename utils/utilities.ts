import { Page } from "@playwright/test";
import { ProductData } from "../data-objects/productData";
import { HomePage } from "../pages/homePage";
import { BillingInfoEnum, MenuTab } from "../data-objects/dataEnums";
import { ProductPage } from "../pages/productPage";
import { BillingInfo } from "../data-objects/billingInfo";
import { MyCartPage } from "../pages/myCartPage";
import { CheckoutPage } from "../pages/checkoutPage";
import { OrderStatusPage } from "../pages/orderStatusPage";

export class DataUtils {

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

    async completeAnOrderAndReturnOrderId(productsDataToSave: Record<string, ProductData>,
        noOfPurchaseProduct: number, billingInfo?: BillingInfo): Promise<string> {

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
