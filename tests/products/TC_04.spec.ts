import { test, expect } from '../../fixtures/beforeAndAfterTest';
import { HomePage } from '../../pages/homePage';
import { LoginPage } from '../../pages/loginPage';
import { ProductPage } from '../../pages/productPage';
import { TestDataUtils } from '../../utils/testDataLoader';
import { MenuTab, ProductSortMode } from '../../data-objects/dataEnums';

const wholeDataSet: Record<string, Record<string, any>[]> = TestDataUtils.loadFullDataSet(__filename);

const testCaseTitleTC04A = 'TC 04A: Verify users can sort items by price';
for (const testData of wholeDataSet[testCaseTitleTC04A]) {
  test(`${testCaseTitleTC04A} - ${testData.setNo}`, async ({ page, setupAction }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const productPage = new ProductPage(page);
    const sortMode: ProductSortMode = ProductSortMode.fromName(testData.sortMode);

    await test.step('Step #2: Login', async () => {
      await homePage.clickLoginLink();
      await loginPage.login();
    });

    await test.step('Step #3: Open the Shop page', async () => {
      await homePage.clickMenuTab(MenuTab.SHOP);
    });

    await test.step('Step #4: Swith to list view mode', async () => {
      await productPage.switchToGridViewMode();
      await productPage.switchToListViewMode();
    });

    await test.step(`Step #5: Sort all products (${sortMode.getFullName()})`, async () => {
      await productPage.selectSortingMode(sortMode);
      await productPage.setToShowAllProductsPerPage();

      const actualDisplayedPrices = await productPage.getAllDisplayedProductsOriginalPrices();
      const expectedSortedPrices = structuredClone(actualDisplayedPrices).sort((a, b) => a - b);
      expect(actualDisplayedPrices).toEqual(expectedSortedPrices);
    });
  });
}

const testCaseTitleTC04B = 'TC 04B: Verify users can sort items by price';
for (const testData of wholeDataSet[testCaseTitleTC04B]) {
  test(`${testCaseTitleTC04B} - ${testData.setNo}`, async ({ page, setupAction }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const productPage = new ProductPage(page);
    const sortMode: ProductSortMode = ProductSortMode.fromName(testData.sortMode);

    await test.step('Step #2: Login', async () => {
      await homePage.clickLoginLink();
      await loginPage.login();
    });

    await test.step('Step #3: Open the Shop page', async () => {
      await homePage.clickMenuTab(MenuTab.SHOP);
    });

    await test.step('Step #4: Swith to list view mode', async () => {
      await productPage.switchToGridViewMode();
      await productPage.switchToListViewMode();
    });

    await test.step(`Step #5: Sort all products (${sortMode.getFullName()})`, async () => {
      await productPage.selectSortingMode(sortMode);
      await productPage.setToShowAllProductsPerPage();

      const actualDisplayedPrices = await productPage.getAllDisplayedProductsOriginalPrices();
      const expectedSortedPrices = structuredClone(actualDisplayedPrices).sort((a, b) => b - a);
      expect(actualDisplayedPrices).toEqual(expectedSortedPrices);
    });
  });
}
