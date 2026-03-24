import { test } from '../../fixtures/beforeAndAfterTest';
import { MenuTab, ProductDepartment } from '../../data-objects/dataEnums';
import { DataUtils } from '../../utils/utilities';
import { ProductData } from '../../data-objects/productData';

test('TC 08: Verify users can clear the cart', async ({ homePage, productPage, myCartPage }) => {
  const selectedProductNumbers: number[] = Array.from({ length: 10 }, () => DataUtils.getRandomInt(1, 6));
  const orderedProductsData: Record<string, ProductData> = {};

  await test.step('Step #1: Open Car Electronics department', async () => {
    await homePage.navigateToTestSite();
    await homePage.clickMenuTab(MenuTab.ABOUT_US);
    await homePage.selectDepartment(ProductDepartment.CAR_ELECTRONICS);
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
    await myCartPage.verifyCartContainsProducts(orderedProductsData);
  });

  await test.step('Step #4: Clear the shopping cart', async () => {
    await myCartPage.emptyShoppingCart();
  });

  await test.step('Step #5: Verify that the shopping cart is empty', async () => {
    await myCartPage.verifyCartIsEmpty();
  });
});
