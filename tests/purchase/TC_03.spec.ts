import { test } from '../../fixtures/beforeAndAfterTest';
import { HomePage } from '../../pages/homePage';
import { ProductPage } from '../../pages/productPage';
import { MyCartPage } from '../../pages/myCartPage';
import { CheckoutPage } from '../../pages/checkoutPage';
import { OrderStatusPage } from '../../pages/orderStatusPage';
import { PathUtils, TestDataUtils } from '../../utils/testDataLoader';
import { BillingInfo } from '../../data-objects/billingInfo';
import { MenuTab, ProductDepartment, ProductViewMode } from '../../data-objects/dataEnums';
import { BrowserContext, Page } from '@playwright/test';
import { DataUtils, FileUtils } from '../../utils/utilities';
import { ProductData } from '../../data-objects/productData';

const wholeDataSet: Record<string, Record<string, any>[]> = TestDataUtils.loadFullDataSet(__filename)
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

// test.describe.configure({ mode: 'default' });
test.beforeEach("Empty the shopping cart before each test", async () => {
  console.log(`[Before each test - ${testClassName}] Emptying the shopping cart for the current test`)
  const homePage = new HomePage(page);
  await homePage.navigateToTestSite();
  await homePage.clickMyCartLink();
  await new MyCartPage(page).emptyShoppingCart();
})

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
      await homePage.navigateToTestSite();
      await homePage.clickMenuTab(MenuTab.ABOUT_US);
      await homePage.selectDepartment(ProductDepartment.CAR_ELECTRONICS);
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
      await myCartPage.verifyCartContainsProducts(orderedProductsData);
      totalCartPrice = await myCartPage.getTotalPriceOfCart();
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
