import { BrowserContext, Page } from '@playwright/test';
import { test, expect } from '../../fixtures/beforeAndAfterTest';
import { MyAccountPage } from '../../pages/myAccountPage';
import { Constants } from '../../utils/constants';
import { PathUtils } from '../../utils/testDataLoader';

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

test('TC 05: Verify orders appear in order history', async ({ }) => {
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

  await test.step('Step #3: Verify that all order ids are sorted in descending order', async () => { });
  // Assert that all order ids are in descending order
  const sortedOrderIds = structuredClone(actualOrderIds).sort((a, b) => b - a);
  expect(actualOrderIds).toStrictEqual(sortedOrderIds);
});
