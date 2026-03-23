import { test } from '../../fixtures/beforeAndAfterTest';
import { HomePage } from '../../pages/homePage';
import { ProductPage } from '../../pages/productPage';
import { ProductDetailsPage } from '../../pages/productDetailsPage';
import { TestDataUtils } from '../../utils/testDataLoader';
import { MenuTab } from '../../data-objects/dataEnums';
import { BrowserContext, Page } from '@playwright/test';
import { FileUtils } from '../../utils/utilities';

const wholeDataSet: Record<string, Record<string, any>[]> = TestDataUtils.loadFullDataSet(__filename);
const fileUtils = new FileUtils();
let userAliasToUse: string;
let context: BrowserContext;
let page: Page;

test.beforeEach(async ({ browser }) => {
  userAliasToUse = await fileUtils.getFreeCredentialToRunTest();
  context = await browser.newContext({ storageState: await fileUtils.getTempStorageStateJsonPath(userAliasToUse) });
  page = await context.newPage();
});

test.afterEach(async () => {
  await fileUtils.releaseBeingUsedCredential(userAliasToUse);
});

const testCaseTitleReviewFlow = 'TC 10: Add product review and verify it appears';
for (const testData of wholeDataSet[testCaseTitleReviewFlow]) {
  test(`${testCaseTitleReviewFlow} - ${testData.setNo}`, async ({ }) => {
    const homePage = new HomePage(page);
    const productPage = new ProductPage(page);
    const productDetailsPage = new ProductDetailsPage(page);
    const reviewRating = testData.reviewRating;
    const reviewTextBase = testData.reviewText;
    let reviewText = '';

    await test.step('Step #1: Navigate to the test site', async () => {
      await homePage.navigateToTestSite();
    });

    await test.step('Step #2: Navigate to Shop page', async () => {
      await homePage.clickMenuTab(MenuTab.SHOP);
    });

    await test.step('Step #3: Navigate to a random product details page from the Shop results', async () => {
      await productPage.openRandomProductDetailsPage();
    });

    await test.step(`Step #4: Submit a ${reviewRating}-star review`, async () => {
      reviewText = await productDetailsPage.addReview(reviewTextBase, reviewRating);
    });

    await test.step('Step #5: Verify review submission confirmation', async () => {
      await productDetailsPage.verifyReviewDisplayed(reviewText);
    });
  });
}
