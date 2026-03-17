import { MenuTab } from '../../data-objects/dataEnums';
import { ProductData } from '../../data-objects/productData';
import { expect, test } from '../../fixtures/beforeAndAfterTest';
import { HomePage } from '../../pages/homePage';
import { MyCartPage } from '../../pages/myCartPage';
import { ProductPage } from '../../pages/productPage';
import { DataUtils } from '../../utils/utilities';

// Run this test using a clean context as logging in is not required
test.use({ storageState: { cookies: [], origins: [] } });
test('TC 09: Verify users can update quantity of product in cart', async ({ page }) => {
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const myCartPage = new MyCartPage(page);
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
