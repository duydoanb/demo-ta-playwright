import { test } from '../../fixtures/beforeAndAfterTest';
import { PathUtils } from '../../utils/testDataLoader';
import { BillingInfo } from '../../data-objects/billingInfo';
import { BillingInfoEnum, MenuTab } from '../../data-objects/dataEnums';
import { DataUtils } from '../../utils/utilities';
import { ProductData } from '../../data-objects/productData';

const testClassName = PathUtils.getSimpleTestClassName(__filename);

test.beforeEach("Empty the shopping cart before each test", async ({ homePage, myCartPage }) => {
  console.log(`[Before each test - ${testClassName}] Emptying the shopping cart for the current test`)
  await homePage.navigateToTestSite();
  await homePage.clickMyCartLink();
  await myCartPage.emptyShoppingCart();
})

test('TC 02: Verify users can buy multiple items successfully', async ({
  homePage, productPage, myCartPage, checkoutPage, orderStatusPage
}) => {
  test.slow();
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
