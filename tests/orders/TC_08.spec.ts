import { test, expect } from '../../fixtures/beforeAndAfterTest';
import { MyAccountPage } from '../../pages/myAccountPage';

test('TC 08: Verify orders appear in order history', async ({ page, basicSetupAction }) => {
  const myAccountPage = new MyAccountPage(page);
  let actualOrderIds: number[] = [];

  await test.step('Step #1: Open the My Account page', async () => {
    await myAccountPage.clickMyAccountLink();
  });

  await test.step('Step #2: Go to the last page of orders history', async () => {
    await myAccountPage.clickRecentOrdersButton();
    actualOrderIds.push(...await myAccountPage.extractAllOrderIdsFromTheFirstPage());
    expect(actualOrderIds.length).toBeGreaterThan(0);
  });

  await test.step('Step #3: Verify that all order ids are sorted in descending order', async () => {
    expect(actualOrderIds).toStrictEqual(structuredClone(actualOrderIds).sort((a, b) => b - a));
  });
});
