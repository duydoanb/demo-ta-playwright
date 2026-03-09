import { test } from '../../fixtures/beforeAndAfterTest';
import { HomePage } from '../../pages/homePage';
import { LoginPage } from '../../pages/loginPage';
import { ProductPage } from '../../pages/productPage';
import { MyCartPage } from '../../pages/myCartPage';
import { CheckoutPage } from '../../pages/checkoutPage';
import { OrderStatusPage } from '../../pages/orderStatusPage';
import { TestDataUtils } from '../../utils/testDataLoader';
import { BillingInfo } from '../../data-objects/billingInfo,';
import { MenuTab } from '../../data-objects/dataEnums';

const wholeDataSet: Record<string, Record<string, any>[]> = TestDataUtils.loadFullDataSet(__filename)

const testCaseTitleTC01A = 'TC 01A: Verify users can buy an item successfully';
for (const testData of wholeDataSet[testCaseTitleTC01A]) {
  test(`${testCaseTitleTC01A} - ${testData.setNo}`, async ({ page, setupAction }) => {
    const departmentName = 'Car Electronics';
    const homePage = new HomePage(page);
    const checkoutPage = new CheckoutPage(page);
    const loginPage = new LoginPage(page);
    const myCartPage = new MyCartPage(page);
    const orderStatusPage = new OrderStatusPage(page);
    const productPage = new ProductPage(page);
    const billingInfo: BillingInfo = new BillingInfo(testData);

    await test.step('Step #2: Login', async () => {
      await homePage.clickLoginLink();
      await loginPage.login();
    });

    await test.step('Step #3: Open Car Electronics department', async () => {
      await homePage.clickMenuTab(MenuTab.ABOUT_US);
      await homePage.selectDepartment(departmentName);
    });

    await test.step('Step #4: Add a product to cart', async () => {
      await productPage.clickAddToCartForProductNo(testData.productNumber);
    });

    await test.step('Step #5: Go to My Cart page and proceed to checkout', async () => {
      await homePage.clickMyCartLink();
      await myCartPage.clickProceedToCheckout();
    });

    await test.step('Step #6: Fill billing details and place order', async () => {
      await checkoutPage.fillBillingDetailsAndPlaceOrder(billingInfo);
    });

    await test.step('Step #7: Verify order is placed successfully', async () => {
      await orderStatusPage.verifyOrderIsConfirmed(billingInfo);
    });
  });
}
