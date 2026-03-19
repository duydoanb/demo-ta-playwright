import { BrowserContext, Page } from '@playwright/test';
import { MenuTab } from '../../data-objects/dataEnums';
import { ProductData } from '../../data-objects/productData';
import { test, expect } from '../../fixtures/beforeAndAfterTest';
import { HomePage } from '../../pages/homePage';
import { MyAccountPage } from '../../pages/myAccountPage';
import { ActionUtils, DataUtils, FileUtils } from '../../utils/utilities';

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

test('TC 05: Verify orders appear in order history', async ({ }) => {
  test.slow();
  const homePage = new HomePage(page);
  const myAccountPage = new MyAccountPage(page);
  const orderedProductsOfOrder1: Record<string, ProductData> = {};
  const orderedProductsOfOrder2: Record<string, ProductData> = {};
  let orderId1: string;
  let orderId2: string;

  await test.step('Step #1: Open products page', async () => {
    await homePage.navigateToTestSite();
    await myAccountPage.clickMenuTab(MenuTab.SHOP);
  });

  await test.step('Step #2: Complete 2 orders and memmoize the order ids', async () => {
    const _actionUtils = new ActionUtils(page);
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
