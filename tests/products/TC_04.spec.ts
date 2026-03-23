import { test, expect } from '../../fixtures/beforeAndAfterTest';
import { TestDataUtils } from '../../utils/testDataLoader';
import { MenuTab, ProductSortMode, ProductViewMode } from '../../data-objects/dataEnums';

const wholeDataSet: Record<string, Record<string, any>[]> = TestDataUtils.loadFullDataSet(__filename);

const testCaseTitleTC04 = 'TC 04: Verify users can sort items by price';
for (const testData of wholeDataSet[testCaseTitleTC04]) {
  test(`${testCaseTitleTC04} - ${testData.setNo}`, async ({ homePage, productPage }) => {
    const sortMode: ProductSortMode = ProductSortMode.fromName(testData.sortMode);

    await test.step('Step #1: Open the Shop page', async () => {
      await homePage.navigateToTestSite();
      await homePage.clickMenuTab(MenuTab.SHOP);
    });

    await test.step('Step #2: Swith to list view mode', async () => {
      await productPage.switchToProductViewMode(ProductViewMode.LIST);
    });

    await test.step(`Step #3: Sort all products (${sortMode.getFullName()})`, async () => {
      await productPage.selectSortingMode(sortMode);
      await productPage.setToShowAllProductsPerPage();
    });

    await test.step(`Step #4: Verify that all products are sorts correctly`, async () => {
      const actualDisplayedPrices = await productPage.getAllDisplayedProductsOriginalPrices();
      expect(actualDisplayedPrices).toEqual(await createSortedPricesList(actualDisplayedPrices, sortMode));
    });
  });
}

async function createSortedPricesList(rawPricesList: number[], sortMode: ProductSortMode) {
  if (sortMode === ProductSortMode.BY_PRICE_LOW_TO_HIGH) {
    return structuredClone(rawPricesList).sort((a, b) => a - b);
  } else if (sortMode === ProductSortMode.BY_PRICE_HIGH_TO_LOW) {
    return structuredClone(rawPricesList).sort((a, b) => b - a);
  } else {
    throw new Error(`The sort mode [${sortMode}] is not supported!`);
  }
}
