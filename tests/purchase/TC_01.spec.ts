import { test } from '../../fixtures/beforeAndAfterTest';
import { HomePage } from '../../pages/homePage';
import { ProductPage } from '../../pages/productPage';
import { MyCartPage } from '../../pages/myCartPage';
import { CheckoutPage } from '../../pages/checkoutPage';
import { OrderStatusPage } from '../../pages/orderStatusPage';
import { PathUtils, TestDataUtils } from '../../utils/testDataLoader';
import { BillingInfo } from '../../data-objects/billingInfo';
import { MenuTab } from '../../data-objects/dataEnums';
import { BrowserContext, Page } from '@playwright/test';
import { Constants } from '../../utils/constants';

const wholeDataSet: Record<string, Record<string, any>[]> = TestDataUtils.loadFullDataSet(__filename)

const testClassName = PathUtils.getSimpleTestClassName(__filename);
let context: BrowserContext;
let page: Page;

test.beforeAll(async ({ browser }) => {
  console.log(__filename);
  const testArguments: Map<string, any> = await Constants.TEST_CLASS_SETUP_TEARDOWN_INSTANCE.basicSetup(testClassName, browser);
  context = testArguments.get('context');
  page = testArguments.get('page');
});

test.afterAll(async () => {
  await Constants.TEST_CLASS_SETUP_TEARDOWN_INSTANCE.basicTeardown(testClassName, context, page);
});

const testCaseTitleTC01A = 'TC 01A: Verify users can buy an item successfully';
for (const testData of wholeDataSet[testCaseTitleTC01A]) {
  test(`${testCaseTitleTC01A} using ${testData.paymentMethod} payment method - ${testData.setNo}`, async ({ }) => {
    const departmentName = 'Car Electronics';
    const homePage = new HomePage(page);
    const checkoutPage = new CheckoutPage(page);
    const myCartPage = new MyCartPage(page);
    const orderStatusPage = new OrderStatusPage(page);
    const productPage = new ProductPage(page);
    const billingInfo: BillingInfo = new BillingInfo(testData);

    await test.step('Step #1: Open Car Electronics department', async () => {
      await homePage.clickMenuTab(MenuTab.ABOUT_US);
      await homePage.selectDepartment(departmentName);
    });

    await test.step('Step #2: Add a product to cart', async () => {
      await productPage.clickAddToCartForProductNo(testData.productNumber);
    });

    await test.step('Step #3: Go to My Cart page and proceed to checkout', async () => {
      await homePage.clickMyCartLink();
      await myCartPage.clickProceedToCheckout();
    });

    await test.step('Step #4: Fill billing details and place order', async () => {
      await checkoutPage.fillBillingDetailsAndPlaceOrder(billingInfo);
    });

    await test.step('Step #5: Verify order is placed successfully', async () => {
      await orderStatusPage.verifyOrderIsConfirmed(billingInfo);
    });
  });
}
