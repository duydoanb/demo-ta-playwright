import { test } from '../../fixtures/beforeAndAfterTest';
import { HomePage } from '../../pages/homePage';
import { ProductPage } from '../../pages/productPage';
import { MyCartPage } from '../../pages/myCartPage';
import { CheckoutPage } from '../../pages/checkoutPage';
import { OrderStatusPage } from '../../pages/orderStatusPage';
import { PathUtils } from '../../utils/testDataLoader';
import { BillingInfo } from '../../data-objects/billingInfo';
import { BillingInfoEnum, MenuTab } from '../../data-objects/dataEnums';
import { BrowserContext, Page } from '@playwright/test';
import { DataUtils, FileUtils } from '../../utils/utilities';
import { ProductData } from '../../data-objects/productData';

const testClassName = PathUtils.getSimpleTestClassName(__filename);
const fileUtils = new FileUtils();
let userAliasToUse: string;
let context: BrowserContext;
let page: Page;

test.beforeEach(async ({ browser }) => {
  userAliasToUse = await fileUtils.getFreeCredentialToRunTest();
  context = await browser.newContext({ storageState: await fileUtils.getTempStorageStateJsonPath(userAliasToUse) });
  page = await context.newPage();
});

test.afterEach(async () => {
  await fileUtils.releaseBeingUsedCredential(userAliasToUse);
});

test.beforeEach("Empty the shopping cart before each test", async () => {
  console.log(`[Before each test - ${testClassName}] Emptying the shopping cart for the current test`)
  const homePage = new HomePage(page);
  await homePage.navigateToTestSite();
  await homePage.clickMyCartLink();
  await new MyCartPage(page).emptyShoppingCart();
})

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
    await myCartPage.verifyCartContainsProducts(orderedProductsData);
    totalCartPrice = DataUtils.getTotalCostOfOrderedProductsAsPriceString(orderedProductsData);
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
