import { test, expect } from '../../fixtures/beforeAndAfterTest';
import { HomePage } from '../../pages/homePage';
import { LoginPage } from '../../pages/loginPage';
import { MyAccountPage } from '../../pages/myAccountPage';


test('TC 05A: Verify orders appear in order history', async ({ page, setupAction }) => {
  const homePage = new HomePage(page);
  const loginPage = new LoginPage(page);
  const myAccountPage = new MyAccountPage(page);

  await test.step('Step #2: Login', async () => {
    await homePage.clickLoginLink();
    await loginPage.login();
  });

  await test.step('Step #3: Open the My Account page', async () => {
    await myAccountPage.clickMyAccountLink();
  });

  await test.step('Step #4: Go to the last page of orders history', async () => {
    await myAccountPage.clickRecentOrdersButton();

    const actualOrderIds: number[] = [];
    actualOrderIds.push(...await myAccountPage.extractAllOrderIdsFromTheFirstPage());
    expect(actualOrderIds.length).toBeGreaterThan(0);

    // Assert that all order ids are in descending order
    const sortedOrderIds = structuredClone(actualOrderIds).sort((a, b) => b - a);
    expect(actualOrderIds).toStrictEqual(sortedOrderIds);
  });

});

test('TC 05B: Verify orders appear in order history', async ({ page, setupAction }) => {
  const homePage = new HomePage(page);
  const loginPage = new LoginPage(page);
  const myAccountPage = new MyAccountPage(page);

  await test.step('Step #2: Login', async () => {
    await homePage.clickLoginLink();
    await loginPage.login();
  });

  await test.step('Step #3: Open the My Account page', async () => {
    await myAccountPage.clickMyAccountLink();
  });

  await test.step('Step #4: Go to the last page of orders history', async () => {
    await myAccountPage.clickRecentOrdersButton();

    const actualOrderIds: number[] = [];
    actualOrderIds.push(...await myAccountPage.extractAllOrderIdsFromTheFirstPage());
    expect(actualOrderIds.length).toBeGreaterThan(0);

    // Assert that all order ids are in descending order
    const sortedOrderIds = structuredClone(actualOrderIds).sort((a, b) => b - a);
    expect(actualOrderIds).toStrictEqual(sortedOrderIds);
  });

});
