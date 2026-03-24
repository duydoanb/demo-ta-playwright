import { BillingInfo } from '../../data-objects/billingInfo';
import { BillingInfoEnum, MenuTab, ProductViewMode } from '../../data-objects/dataEnums';
import { test } from '../../fixtures/beforeAndAfterTest';
import { DataUtils } from '../../utils/utilities';
import { ProductData } from '../../data-objects/productData';
import { Constants } from '../../utils/constants';

// Run this test using a clean context to avoid logging in.
// Not needed now
// test.use({ storageState: { cookies: [], origins: [] } });
test('TC 06: Verify users try to buy an item without logging in (As a guest)', async ({
  homePageClean, checkoutPageClean, myCartPageClean, orderStatusPageClean, productPageClean }, testInfo) => {

  Constants.SET_CURRENT_STEP_CONTEXT(testInfo);
  const billingInfo: BillingInfo = new BillingInfo(await BillingInfoEnum.VN_ADDRESS_1.convertToRecordObject());
  const randomProductNumber: number = DataUtils.getRandomInt(1, 6);
  const orderedProductsData: Record<string, ProductData> = {};
  let totalCartPrice: string;

  await test.step('Pre-condition #1: Navigate to the test site', async () => {
    await homePageClean.navigateToTestSite();
  });

  await test.step('Step #1: Go to Shop page', async () => {
    await homePageClean.clickMenuTab(MenuTab.SHOP);
  });

  await test.step('Step #2: Switch view mode to list', async () => {
    await productPageClean.switchToProductViewMode(ProductViewMode.LIST);
  });

  await test.step('Step #3: Add a product to cart and memoize product title and current price', async () => {
    await productPageClean.clickAddToCartForProductNo(randomProductNumber);
    const _currentProductData = new ProductData({
      title: await productPageClean.getTitleOfProductNo(randomProductNumber),
      priceString: await productPageClean.getCurrentPriceOfProductNo(randomProductNumber),
      quantity: 1
    });
    DataUtils.addProductDataIntoProductsDataRecord(orderedProductsData, _currentProductData);
  });

  await test.step('Step #4: Go to My Cart page', async () => {
    await productPageClean.clickMyCartLink();
  });

  await test.step('Step #5: Verify that the product details is correct', async () => {
    await myCartPageClean.verifyCartContainsProducts(orderedProductsData);
    totalCartPrice = await myCartPageClean.getTotalPriceOfCart();
  });

  await test.step('Step #6: Proceed to checkout', async () => {
    await myCartPageClean.clickProceedToCheckout();
  });

  await test.step('Step #7: Fill billing details and place order', async () => {
    await checkoutPageClean.fillBillingDetailsAndPlaceOrder(billingInfo);
  });

  await test.step('Step #8: Verify the order is placed successfully', async () => {
    await orderStatusPageClean.verifyOrderIsConfirmed(billingInfo, totalCartPrice, orderedProductsData, true);
  });
});
