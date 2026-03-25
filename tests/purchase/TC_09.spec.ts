import { MenuTab } from '../../data-objects/dataEnums';
import { ProductData } from '../../data-objects/productData';
import { test } from '../../fixtures/beforeAndAfterTest';
import { DataUtils } from '../../utils/utilities';
import { Logger } from '../../utils/logger';

test.beforeEach("Empty the shopping cart before each test", async ({ homePage, myCartPage }) => {
  Logger.info(`[Before each test] Emptying the shopping cart for the current test`)
  await homePage.navigateToTestSite();
  await homePage.clickMyCartLink();
  await myCartPage.emptyShoppingCart();
})

test('TC 09: Verify users can update quantity of product in cart', async ({ homePage, productPage, myCartPage }) => {
  const orderedProductsData: Record<string, ProductData> = {};
  let productData: ProductData;

  await test.step('Step #1: Open the product page', async () => {
    await homePage.navigateToTestSite();
    await homePage.clickMenuTab(MenuTab.SHOP);
  });

  await test.step('Step #2: Select a product and go to the shopping cart', async () => {
    const _selectedProductNo = DataUtils.getRandomInt(1, 6);
    await productPage.clickAddToCartForProductNo(_selectedProductNo);
    productData = new ProductData({
      title: await productPage.getTitleOfProductNo(_selectedProductNo),
      priceString: await productPage.getCurrentPriceOfProductNo(_selectedProductNo),
      quantity: 1
    });
    DataUtils.addProductDataIntoProductsDataRecord(orderedProductsData, productData);

    await productPage.clickMyCartLink();
  });

  await test.step('Step #3: Verify that the product details is correct', async () => {
    await myCartPage.verifyCartContainsProducts(orderedProductsData);
  });

  await test.step("Step #4: Increment the current product's quantity by 1 and verify that the quantity and subtotal price are updated correctly", async () => {
    await myCartPage.changeProductQuantityTo(productData, productData.quantity + 1);
    await myCartPage.verifyProductDataAndSubtotalPriceOfCart(productData, orderedProductsData);
  });

  await test.step("Step #5: Set the current product's quantity to 4 and verify that the quantity and subtotal price are updated correctly", async () => {
    await myCartPage.changeProductQuantityTo(productData, 4, true);
    await myCartPage.verifyProductDataAndSubtotalPriceOfCart(productData, orderedProductsData);
  });

  await test.step("Step #6: Increment the current product's quantity by 1 and verify that the quantity and subtotal price are updated correctly", async () => {
    await myCartPage.changeProductQuantityTo(productData, productData.quantity - 1);
    await myCartPage.verifyProductDataAndSubtotalPriceOfCart(productData, orderedProductsData);
  });

  await test.step("Step #7: Set the current product's quantity to 12 and verify that the quantity and subtotal price are updated correctly", async () => {
    await myCartPage.changeProductQuantityTo(productData, 12, true);
    await myCartPage.verifyProductDataAndSubtotalPriceOfCart(productData, orderedProductsData);
  });

  await test.step("Step #8: Set the current product's quantity to 0 and verify that the cart is empty", async () => {
    await myCartPage.changeProductQuantityTo(productData, 0);
    await myCartPage.verifyCartIsEmpty();
  });
});
