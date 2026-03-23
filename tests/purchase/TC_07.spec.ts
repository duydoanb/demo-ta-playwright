import { MenuTab, ProductViewMode } from '../../data-objects/dataEnums';
import { test } from '../../fixtures/beforeAndAfterTest';
import { DataUtils } from '../../utils/utilities';

// Run this test using a clean context as logging in is not required
// Not needed now
// test.use({ storageState: { cookies: [], origins: [] } });
test('TC 07: Ensure proper error handling when mandatory fields are blank', async ({
  page,
  homePageClean,
  checkoutPageClean,
  myCartPageClean,
  productPageClean
}) => {
  const billingDataFillingStatus: Record<string, Record<string, boolean>> = {
    firstName: { isFilled: false },
    lastName: { isFilled: false },
    address1: { isFilled: false },
    city: { isFilled: false },
    phone: { isFilled: false },
    postalCode: { isFilled: false },
    email: { isFilled: false }
  };

  await test.step('Pre-condition #1: Navigate to the test site', async () => {
    await homePageClean.navigateToTestSite();
  });

  await test.step('Step #1: Go to Shop page', async () => {
    await homePageClean.clickMenuTab(MenuTab.SHOP);
  });

  await test.step('Step #2: Switch view mode to list', async () => {
    await productPageClean.switchToProductViewMode(ProductViewMode.LIST);
  });

  await test.step('Step #3: Add a product to cart', async () => {
    await productPageClean.clickAddToCartForProductNo(DataUtils.getRandomInt(1, 6));
  });

  await test.step('Step #4: Go to My Cart page and proceed to checkout', async () => {
    await productPageClean.clickMyCartLink();
    await myCartPageClean.clickProceedToCheckout();
  });

  await test.step('Step #5: Skip filling billing details and click the Place order button', async () => {
    await checkoutPageClean.clickPlaceOrderBtn();
  });

  await test.step('Step #6: Check that alerts for required missing fields are displayed', async () => {
    await checkoutPageClean.verifyAlertsForMissingFieldsAreDisplayed(billingDataFillingStatus);
  });

  await test.step('Step #7: Fill data into the first name textbox and click Place order and verify the alert for it is not displayed anymore', async () => {
    await page.reload();
    await checkoutPageClean.fillFirstName("first name");
    billingDataFillingStatus['firstName']['isFilled'] = true;
    await checkoutPageClean.clickPlaceOrderBtn();
    await checkoutPageClean.verifyAlertsForMissingFieldsAreDisplayed(billingDataFillingStatus);
  });

  await test.step('Step #8: Fill data into the last name textbox and click Place order and verify the alert for it is not displayed anymore', async () => {
    await page.reload();
    await checkoutPageClean.fillLastName("last name");
    billingDataFillingStatus['lastName']['isFilled'] = true;
    await checkoutPageClean.clickPlaceOrderBtn();
    await checkoutPageClean.verifyAlertsForMissingFieldsAreDisplayed(billingDataFillingStatus);
  });

  await test.step('Step #9: Fill data into the main address textbox and click Place order and verify the alert for it is not displayed anymore', async () => {
    await page.reload();
    await checkoutPageClean.fillAddress1("address 1");
    billingDataFillingStatus['address1']['isFilled'] = true;
    await checkoutPageClean.clickPlaceOrderBtn();
    await checkoutPageClean.verifyAlertsForMissingFieldsAreDisplayed(billingDataFillingStatus);
  });

  await test.step('Step #10: Fill data into the main address textbox and click Place order and verify the alert for it is not displayed anymore', async () => {
    await page.reload();
    await checkoutPageClean.fillCityOrTown("city name");
    billingDataFillingStatus['city']['isFilled'] = true;
    await checkoutPageClean.clickPlaceOrderBtn();
    await checkoutPageClean.verifyAlertsForMissingFieldsAreDisplayed(billingDataFillingStatus);
  });

  await test.step('Step #11: Fill data into the phone number textbox and click Place order and verify the alert for it is not displayed anymore', async () => {
    await page.reload();
    await checkoutPageClean.fillPhoneNumber("123456789");
    billingDataFillingStatus['phone']['isFilled'] = true;
    await checkoutPageClean.clickPlaceOrderBtn();
    await checkoutPageClean.verifyAlertsForMissingFieldsAreDisplayed(billingDataFillingStatus);
  });

  await test.step('Step #12: Fill data into the ZIP code textbox and click Place order and verify the alert for it is not displayed anymore', async () => {
    await page.reload();
    await checkoutPageClean.fillPostalCode("94105");
    billingDataFillingStatus['postalCode']['isFilled'] = true;
    await checkoutPageClean.clickPlaceOrderBtn();
    await checkoutPageClean.verifyAlertsForMissingFieldsAreDisplayed(billingDataFillingStatus);
  });

  await test.step('Step #13: Fill data into the email textbox and click Place order and verify the alert for it is not displayed anymore', async () => {
    await page.reload();
    await checkoutPageClean.fillEmailAddress("email@example.com");
    billingDataFillingStatus['email']['isFilled'] = true;
    await checkoutPageClean.clickPlaceOrderBtn();
    await checkoutPageClean.verifyAlertsForMissingFieldsAreDisplayed(billingDataFillingStatus);
  });
});
