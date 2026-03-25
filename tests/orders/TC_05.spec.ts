import { MenuTab } from '../../data-objects/dataEnums';
import { ProductData } from '../../data-objects/productData';
import { test, expect } from '../../fixtures/beforeAndAfterTest';
import { Logger } from '../../utils/logger';
import { ActionUtils, DataUtils } from '../../utils/utilities';

test.beforeEach("Empty the shopping cart before each test", async ({ homePage, myCartPage }) => {
  Logger.info(`[Before each test] Emptying the shopping cart for the current test`)
  await homePage.navigateToTestSite();
  await homePage.clickMyCartLink();
  await myCartPage.emptyShoppingCart();
})

test('TC 05: Verify orders appear in order history', async ({ pageWithPreparedCred, homePage, myAccountPage }) => {
  test.slow();
  const orderedProductsOfOrder1: Record<string, ProductData> = {};
  const orderedProductsOfOrder2: Record<string, ProductData> = {};
  let orderId1: string;
  let orderId2: string;

  await test.step('Step #1: Open products page', async () => {
    await homePage.navigateToTestSite();
    await myAccountPage.clickMenuTab(MenuTab.SHOP);
  });

  await test.step('Step #2: Complete 2 orders and memmoize the order ids', async () => {
    const _actionUtils = new ActionUtils(pageWithPreparedCred);
    orderId1 = await _actionUtils.completeAnOrderAndReturnOrderId(orderedProductsOfOrder1, 5);
    orderId2 = await _actionUtils.completeAnOrderAndReturnOrderId(orderedProductsOfOrder2, 5);
  });

  await test.step('Step #3: Open My orders page', async () => {
    await homePage.clickMyAccountLink();
    await myAccountPage.clickRecentOrdersButton();
  });

  await test.step('Step #4: Verify the data of the first order is correct', async () => {
    await myAccountPage.findAndViewOrderDetailsLinkByOrderId(orderId1);
    await myAccountPage.verifyOrderDetailsTableDataIsCorrect(orderedProductsOfOrder1);
    expect(await myAccountPage.getOrderSubtotalPriceAsString()).toStrictEqual(DataUtils.getTotalCostOfOrderedProductsAsPriceString(orderedProductsOfOrder1));
  });

  await test.step('Step #5: Verify the data of the second order is correct', async () => {
    await myAccountPage.clickMyAccountLink();
    await myAccountPage.clickRecentOrdersButton();
    await myAccountPage.findAndViewOrderDetailsLinkByOrderId(orderId2);
    await myAccountPage.verifyOrderDetailsTableDataIsCorrect(orderedProductsOfOrder2);
    expect(await myAccountPage.getOrderSubtotalPriceAsString()).toStrictEqual(DataUtils.getTotalCostOfOrderedProductsAsPriceString(orderedProductsOfOrder2));
  });

});
