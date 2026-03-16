import { BillingInfo } from '../../data-objects/billingInfo';
import { BillingInfoEnum, MenuTab, ProductViewMode } from '../../data-objects/dataEnums';
import { test } from '../../fixtures/beforeAndAfterTest';
import { CheckoutPage } from '../../pages/checkoutPage';
import { HomePage } from '../../pages/homePage';
import { MyCartPage } from '../../pages/myCartPage';
import { OrderStatusPage } from '../../pages/orderStatusPage';
import { ProductPage } from '../../pages/productPage';
import { DataUtils } from '../../utils/utilities';
import { ProductData } from '../../data-objects/productData';

// Run this test using a clean context.
test.use({ storageState: { cookies: [], origins: [] } });
test('TC 06: Verify users try to buy an item without logging in (As a guest)', async ({ page }) => {
  const homePage = new HomePage(page);
  const checkoutPage = new CheckoutPage(page);
  const myCartPage = new MyCartPage(page);
  const orderStatusPage = new OrderStatusPage(page);
  const productPage = new ProductPage(page);
  const billingInfo: BillingInfo = new BillingInfo(await BillingInfoEnum.VN_ADDRESS_1.convertToRecordObject());
  const randomProductNumber: number = DataUtils.getRandomInt(1, 6);
  const orderedProductsData: Record<string, ProductData> = {};
  let totalCartPrice: string;

  await test.step('Pre-condition #1: Navigate to the test site', async () => {
    await homePage.navigateToTestSite();
  });

  await test.step('Step #1: Go to Shop page', async () => {
    await homePage.clickMenuTab(MenuTab.SHOP);
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
    await orderStatusPage.verifyOrderIsConfirmed(billingInfo, totalCartPrice, orderedProductsData, true);
  });
});
