import { test } from '../../fixtures/beforeAndAfterTest';
import { HomePage } from '../../pages/homePage';
import { ProductPage } from '../../pages/productPage';
import { MyCartPage } from '../../pages/myCartPage';
import { CheckoutPage } from '../../pages/checkoutPage';
import { OrderStatusPage } from '../../pages/orderStatusPage';
import { PathUtils, TestDataUtils } from '../../utils/testDataLoader';
import { BillingInfo } from '../../data-objects/billingInfo';
import { MenuTab, ProductViewMode } from '../../data-objects/dataEnums';
import { BrowserContext, Page } from '@playwright/test';
import { Constants } from '../../utils/constants';
import { DataUtils } from '../../utils/utilities';

const wholeDataSet: Record<string, Record<string, any>[]> = TestDataUtils.loadFullDataSet(__filename)

const testClassName = PathUtils.getSimpleTestClassName(__filename);
let context: BrowserContext;
let page: Page;

// Purchase flow is sensitive, better keep it 1 thread at a time!
test.describe.configure({ mode: 'default' });
test.beforeAll(async ({ browser }) => {
  const testArguments: Map<string, any> = await Constants.TEST_CLASS_SETUP_TEARDOWN_INSTANCE.basicSetup(testClassName, browser);
  context = testArguments.get('context');
  page = testArguments.get('page');
});

test.afterAll(async () => {
  await Constants.TEST_CLASS_SETUP_TEARDOWN_INSTANCE.basicTeardown(testClassName, context, page);
});

const testCaseTitleTC01 = 'TC 01: Verify users can buy an item successfully';
for (const testData of wholeDataSet[testCaseTitleTC01]) {
  test(`${testCaseTitleTC01} using ${testData.paymentMethod} payment method - ${testData.setNo}`, async ({ }) => {
    const departmentName = 'Car Electronics';
    const homePage = new HomePage(page);
    const checkoutPage = new CheckoutPage(page);
    const myCartPage = new MyCartPage(page);
    const orderStatusPage = new OrderStatusPage(page);
    const productPage = new ProductPage(page);
    const billingInfo: BillingInfo = new BillingInfo(testData);
    const randomProductNumber: number = DataUtils.getRandomInt(1, 6);
    const selectedProductsData: Map<string, string>[] = [];
    let totalCartPrice: string;

    await test.step('Pre-condition #1: Empty the shopping cart', async () => {
      await homePage.clickMyCartLink();
      await myCartPage.emptyShoppingCart();
    });


    await test.step('Step #1: Open Car Electronics department', async () => {
      await homePage.clickMenuTab(MenuTab.ABOUT_US);
      await homePage.selectDepartment(departmentName);
    });

    await test.step('Step #2: Switch view mode to list', async () => {
      await productPage.switchToProductViewMode(ProductViewMode.LIST);
    });

    await test.step('Step #3: Add a product to cart and memoize product title and current price', async () => {
      await productPage.clickAddToCartForProductNo(randomProductNumber);
      const _tempData: Map<string, string> = new Map;
      _tempData.set('title', await productPage.getTitleOfProductNo(randomProductNumber));
      _tempData.set('price', await productPage.getCurrentPriceOfProductNo(randomProductNumber));
    });

    await test.step('Step #4: Go to My Cart page', async () => {
      await productPage.clickMyCartLink();
    });

    await test.step('Step #5: Verify that the product details is correct', async () => {
      await myCartPage.verifyCartContainsProducts(selectedProductsData);
      totalCartPrice = await myCartPage.getTotalCartPrice();
    });

    await test.step('Step #6: Proceed to checkout', async () => {
      await myCartPage.clickProceedToCheckout();
    });

    await test.step('Step #7: Fill billing details and place order', async () => {
      await checkoutPage.fillBillingDetailsAndPlaceOrder(billingInfo);
    });

    await test.step('Step #8: Verify the order is placed successfully', async () => {
      await orderStatusPage.verifyOrderIsConfirmed(billingInfo, totalCartPrice);
    });
  });
}

const testCaseTitleTC02 = 'TC 02: Verify users can buy multiple items successfully';
for (const testData of wholeDataSet[testCaseTitleTC02]) {
  test(testCaseTitleTC02, async ({ }) => {
    const homePage = new HomePage(page);
    const productPage = new ProductPage(page);
    const myCartPage = new MyCartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const orderStatusPage = new OrderStatusPage(page);
    const billingInfo: BillingInfo = new BillingInfo(testData);
    const selectedProductNumbers: number[] = [DataUtils.getRandomInt(1, 21), DataUtils.getRandomInt(1, 21), DataUtils.getRandomInt(1, 21), DataUtils.getRandomInt(1, 21), DataUtils.getRandomInt(1, 21), DataUtils.getRandomInt(1, 21), DataUtils.getRandomInt(1, 21)];
    const selectedProductsData: Map<string, string>[] = [];
    let totalCartPrice: string;


    await test.step('Step #1: Go to Shop page', async () => {
      await homePage.clickMenuTab(MenuTab.SHOP);
    });

    await test.step('Step #2: Select multiple products and memoize their data', async () => {
      for (const productNumber of selectedProductNumbers) {
        await productPage.clickAddToCartForProductNo(productNumber);
        const _tempProductData: Map<string, string> = new Map;
        _tempProductData.set('title', await productPage.getTitleOfProductNo(productNumber))
        _tempProductData.set('price', await productPage.getCurrentPriceOfProductNo(productNumber))
        selectedProductsData.push(_tempProductData);
      }
    });

    await test.step('Step #3: Go to the shopping cart', async () => {
      await productPage.clickMyCartLink();
    });

    await test.step('Step #4: Verify that all of the products details are correct', async () => {
      await myCartPage.verifyCartContainsProducts(selectedProductsData);
      totalCartPrice = await myCartPage.getTotalCartPrice();
    });

    await test.step('Step #5: Proceed to checkout', async () => {
      await myCartPage.clickProceedToCheckout();
    });

    await test.step('Step #6: Fill billing details and place order', async () => {
      await checkoutPage.fillBillingDetailsAndPlaceOrder(billingInfo);
    });

    await test.step('Step #7: Verify the order is placed successfully', async () => {
      await orderStatusPage.verifyOrderIsConfirmed(billingInfo, totalCartPrice);
    });
  });
}
