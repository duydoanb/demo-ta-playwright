import { test } from '../../fixtures/beforeAndAfterTest';
import { HomePage } from '../../pages/homePage';
import { ProductPage } from '../../pages/productPage';
import { MyCartPage } from '../../pages/myCartPage';
import { CheckoutPage } from '../../pages/checkoutPage';
import { OrderStatusPage } from '../../pages/orderStatusPage';
import { PathUtils, TestDataUtils } from '../../utils/testDataLoader';
import { BillingInfo } from '../../data-objects/billingInfo';
import { BillingInfoEnum, MenuTab, ProductDepartment, ProductViewMode } from '../../data-objects/dataEnums';
import { BrowserContext, Page } from '@playwright/test';
import { Constants } from '../../utils/constants';
import { DataUtils } from '../../utils/utilities';
import { ProductData } from '../../data-objects/productData';

const wholeDataSet: Record<string, Record<string, any>[]> = TestDataUtils.loadFullDataSet(__filename)

const testClassName = PathUtils.getSimpleTestClassName(__filename);
let context: BrowserContext;
let page: Page;

/***
    Purchase flow is sensitive, better keep it 1 purchase attemp at a time!
***/

test.describe.configure({ mode: 'default' });
test.beforeAll(async ({ browser }) => {
  const testArguments: Map<string, any> = await Constants.TEST_CLASS_SETUP_TEARDOWN_INSTANCE.basicSetup(testClassName, browser);
  context = testArguments.get('context');
  page = testArguments.get('page');
});

test.afterAll(async () => {
  await Constants.TEST_CLASS_SETUP_TEARDOWN_INSTANCE.basicTeardown(testClassName, context, page);
});

test.beforeEach("Empty the shopping cart before each test", async () => {
  console.log(`[Before each test - ${testClassName}] Emptying the shopping cart for the current test`)
  await new HomePage(page).clickMyCartLink();
  await new MyCartPage(page).emptyShoppingCart();
})

const testCaseTitleTC01 = 'TC 01: Verify users can buy an item successfully';
for (const testData of wholeDataSet[testCaseTitleTC01]) {
  test(`${testCaseTitleTC01} with country as ${testData.country} - ${testData.setNo}`, async ({ }) => {
    const homePage = new HomePage(page);
    const checkoutPage = new CheckoutPage(page);
    const myCartPage = new MyCartPage(page);
    const orderStatusPage = new OrderStatusPage(page);
    const productPage = new ProductPage(page);
    const billingInfo: BillingInfo = new BillingInfo(testData);
    const randomProductNumber: number = DataUtils.getRandomInt(1, 6);
    const orderedProductsData: Record<string, ProductData> = {};
    let totalCartPrice: string;

    await test.step('Step #1: Open Car Electronics department', async () => {
      await homePage.clickMenuTab(MenuTab.ABOUT_US);
      await homePage.selectDepartment(ProductDepartment.CAR_ELECTRONICS.getFullName());
    });

    await test.step('Step #2: Switch view mode to list', async () => {
      await productPage.switchToProductViewMode(ProductViewMode.LIST);
    });

    await test.step('Step #3: Add a product to cart and memoize product title and current price', async () => {
      await productPage.clickAddToCartForProductNo(randomProductNumber);
      const _currentProductData = new ProductData({
        title: await productPage.getTitleOfProductNo(randomProductNumber),
        priceString: await productPage.getCurrentPriceOfProductNo(randomProductNumber),
        quantity: 1
      });
      DataUtils.addProductDataIntoProductsDataRecord(orderedProductsData, _currentProductData);
    });

    await test.step('Step #4: Go to My Cart page', async () => {
      await productPage.clickMyCartLink();
    });

    await test.step('Step #5: Verify that the product details is correct', async () => {
      await myCartPage.verifyCartContainsProductsNew(orderedProductsData);
      totalCartPrice = await myCartPage.getTotalCartPrice();
    });

    await test.step('Step #6: Proceed to checkout', async () => {
      await myCartPage.clickProceedToCheckout();
    });

    await test.step('Step #7: Fill billing details and place order', async () => {
      await checkoutPage.fillBillingDetailsAndPlaceOrder(billingInfo);
    });

    await test.step('Step #8: Verify the order is placed successfully', async () => {
      await orderStatusPage.verifyOrderIsConfirmed(billingInfo, totalCartPrice, orderedProductsData);
    });
  });
}

test('TC 02: Verify users can buy multiple items successfully', async ({ }) => {
  test.slow();
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const myCartPage = new MyCartPage(page);
  const checkoutPage = new CheckoutPage(page);
  const orderStatusPage = new OrderStatusPage(page);
  const billingInfo: BillingInfo = new BillingInfo(await BillingInfoEnum.US_ADDRESS_1.convertToRecordObject());
  const selectedProductNumbers: number[] = Array.from({ length: 10 }, () => DataUtils.getRandomInt(1, 21));
  const orderedProductsData: Record<string, ProductData> = {};
  let totalCartPrice: string;

  await test.step('Step #1: Go to Shop page', async () => {
    await homePage.clickMenuTab(MenuTab.SHOP);
  });

  await test.step('Step #2: Select multiple products and memoize their data', async () => {
    for (const productNumber of selectedProductNumbers) {
      await productPage.clickAddToCartForProductNo(productNumber);
      const _currentProductData = new ProductData({
        title: await productPage.getTitleOfProductNo(productNumber),
        priceString: await productPage.getCurrentPriceOfProductNo(productNumber),
        quantity: 1
      });
      DataUtils.addProductDataIntoProductsDataRecord(orderedProductsData, _currentProductData);
    }
  });

  await test.step('Step #3: Go to the shopping cart', async () => {
    await productPage.clickMyCartLink();
  });

  await test.step('Step #4: Verify that all of the products details are correct', async () => {
    await myCartPage.verifyCartContainsProductsNew(orderedProductsData);
    totalCartPrice = await myCartPage.getTotalCartPrice();
  });

  await test.step('Step #5: Proceed to checkout', async () => {
    await myCartPage.clickProceedToCheckout();
  });

  await test.step('Step #6: Fill billing details and place order', async () => {
    await checkoutPage.fillBillingDetailsAndPlaceOrder(billingInfo);
  });

  await test.step('Step #7: Verify the order is placed successfully', async () => {
    await orderStatusPage.verifyOrderIsConfirmed(billingInfo, totalCartPrice, orderedProductsData);
  });
});

const testCaseTitleTC03 = 'TC 03: Verify users can buy an item using different payment methods (all payment methods)';
for (const testData of wholeDataSet[testCaseTitleTC03]) {
  test(`${testCaseTitleTC03} using ${testData.paymentMethod} payment method - ${testData.setNo}`, async ({ }) => {
    const homePage = new HomePage(page);
    const checkoutPage = new CheckoutPage(page);
    const myCartPage = new MyCartPage(page);
    const orderStatusPage = new OrderStatusPage(page);
    const productPage = new ProductPage(page);
    const billingInfo: BillingInfo = new BillingInfo(testData);
    const randomProductNumber: number = DataUtils.getRandomInt(1, 6);
    const orderedProductsData: Record<string, ProductData> = {};
    let totalCartPrice: string;

    await test.step('Step #1: Open Car Electronics department', async () => {
      await homePage.clickMenuTab(MenuTab.ABOUT_US);
      await homePage.selectDepartment(ProductDepartment.CAR_ELECTRONICS.getFullName());
    });

    await test.step('Step #2: Switch view mode to list', async () => {
      await productPage.switchToProductViewMode(ProductViewMode.LIST);
    });

    await test.step('Step #3: Add a product to cart and memoize product title and current price', async () => {
      await productPage.clickAddToCartForProductNo(randomProductNumber);
      const _currentProductData = new ProductData({
        title: await productPage.getTitleOfProductNo(randomProductNumber),
        priceString: await productPage.getCurrentPriceOfProductNo(randomProductNumber),
        quantity: 1
      });
      DataUtils.addProductDataIntoProductsDataRecord(orderedProductsData, _currentProductData);
    });

    await test.step('Step #4: Go to My Cart page', async () => {
      await productPage.clickMyCartLink();
    });

    await test.step('Step #5: Verify that the product details is correct', async () => {
      await myCartPage.verifyCartContainsProductsNew(orderedProductsData);
      totalCartPrice = await myCartPage.getTotalCartPrice();
    });

    await test.step('Step #6: Proceed to checkout', async () => {
      await myCartPage.clickProceedToCheckout();
    });

    await test.step('Step #7: Fill billing details and place order', async () => {
      await checkoutPage.fillBillingDetailsAndPlaceOrder(billingInfo);
    });

    await test.step('Step #8: Verify the order is placed successfully', async () => {
      await orderStatusPage.verifyOrderIsConfirmed(billingInfo, totalCartPrice, orderedProductsData);
    });
  });
}

test('TC 08: Verify users can clear the cart', async ({ }) => {
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const myCartPage = new MyCartPage(page);
  const selectedProductNumbers: number[] = Array.from({ length: 10 }, () => DataUtils.getRandomInt(1, 6));
  const orderedProductsData: Record<string, ProductData> = {};

  await test.step('Step #1: Open Car Electronics department', async () => {
    await homePage.clickMenuTab(MenuTab.ABOUT_US);
    await homePage.selectDepartment(ProductDepartment.CAR_ELECTRONICS.getFullName());
  });

  await test.step('Step #2: Select multiple products and go to the shopping cart', async () => {
    for (const productNumber of selectedProductNumbers) {
      await productPage.clickAddToCartForProductNo(productNumber);
      const _currentProductData = new ProductData({
        title: await productPage.getTitleOfProductNo(productNumber),
        priceString: await productPage.getCurrentPriceOfProductNo(productNumber),
        quantity: 1
      });
      DataUtils.addProductDataIntoProductsDataRecord(orderedProductsData, _currentProductData);
    }

    await productPage.clickMyCartLink();
  });

  await test.step('Step #3: Verify that all of the products details are correct', async () => {
    await myCartPage.verifyCartContainsProductsNew(orderedProductsData);
  });

  await test.step('Step #4: Clear the shopping cart', async () => {
    await myCartPage.emptyShoppingCart();
  });

  await test.step('Step #5: Verify that the shopping cart is empty', async () => {
    await myCartPage.verifyCartIsEmpty();
  });
});
