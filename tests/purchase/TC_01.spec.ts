import { test } from '../../fixtures/beforeAndAfterTest';
import { PathUtils, TestDataUtils } from '../../utils/testDataLoader';
import { BillingInfo } from '../../data-objects/billingInfo';
import { MenuTab, ProductDepartment, ProductViewMode } from '../../data-objects/dataEnums';
import { DataUtils } from '../../utils/utilities';
import { ProductData } from '../../data-objects/productData';
import { Logger } from '../../utils/logger';

const wholeDataSet: Record<string, Record<string, any>[]> = TestDataUtils.loadFullDataSet(__filename)
const testClassName = PathUtils.getSimpleTestClassName(__filename);

test.beforeEach("Empty the shopping cart before each test", async ({ homePage, myCartPage }) => {
  Logger.info(`[Before each test] Emptying the shopping cart for the current test`)
  await homePage.navigateToTestSite();
  await homePage.clickMyCartLink();
  await myCartPage.emptyShoppingCart();
})

const testCaseTitleTC01 = 'TC 01: Verify users can buy an item successfully';
for (const testData of wholeDataSet[testCaseTitleTC01]) {
  test(`${testCaseTitleTC01} with country as ${testData.country} - ${testData.setNo}`, async ({
    homePage, productPage, myCartPage, checkoutPage, orderStatusPage
  }) => {
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
