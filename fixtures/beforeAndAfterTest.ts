import path from 'path';
import { readFileSync } from 'fs';
import { test as baseTest, Browser, BrowserContext, expect as expectBase, Page } from '@playwright/test';
import { HomePage } from '../pages/homePage';
import { LoginPage } from '../pages/loginPage';
import { CheckoutPage } from '../pages/checkoutPage';
import { MyAccountPage } from '../pages/myAccountPage';
import { MyCartPage } from '../pages/myCartPage';
import { OrderStatusPage } from '../pages/orderStatusPage';
import { ProductPage } from '../pages/productPage';
import { ProductDetailsPage } from '../pages/productDetailsPage';
import { FileUtils } from '../utils/utilities';
import { Logger } from '../utils/logger';
import { Constants } from '../utils/constants';


// Define the types for your fixtures
export type MyFixtures = {
    basicSetupAction: Record<string, any>,
    singleTestDataProvider: Record<string, any>,
    dataProviderForAllTests: Record<string, Record<string, any>[]>,

    // Page objects with preprared authdata embedded
    pageWithPreparedCred: Page,
    contextWithPreparedCred: BrowserContext,
    homePage: HomePage,
    loginPage: LoginPage,
    checkoutPage: CheckoutPage,
    myAccountPage: MyAccountPage,
    myCartPage: MyCartPage,
    orderStatusPage: OrderStatusPage,
    productDetailsPage: ProductDetailsPage,
    productPage: ProductPage,

    // Clean Page objects
    homePageClean: HomePage,
    loginPageClean: LoginPage,
    checkoutPageClean: CheckoutPage,
    myAccountPageClean: MyAccountPage,
    myCartPageClean: MyCartPage,
    orderStatusPageClean: OrderStatusPage,
    productDetailsPageClean: ProductDetailsPage,
    productPageClean: ProductPage,

};

// Extend the base test
export const test = baseTest.extend<MyFixtures>({
    basicSetupAction: async ({ page }, use, testInfo) => {
        const basicSetupAction = new Map<string, any>();
        const homePage = new HomePage(page);
        const testName = testInfo.title;
        Constants.SET_CURRENT_STEP_CONTEXT(testInfo);

        // This runs BEFORE each test (Like @BeforeMethod)
        await test.step('Pre-condition: Navigate to the main page and login if possible', async () => {
            Logger.step('Pre-condition: Navigate to the main page and login if possible');
            await homePage.navigateToTestSite();
            if (await homePage.isLoginLinkVisible()) {
                await homePage.clickLoginLink();
                await new LoginPage(page).login();
            }
            Logger.info(`[BEFORE METHOD] [${testName}] [SETUP ACTION]: END...`);
        });

        basicSetupAction.set('homePage', homePage);
        basicSetupAction.set('testInfo', testInfo);
        await use(basicSetupAction); // The test runs here

        // Logic after use() runs AFTER each test (Like @AfterMethod)
        await test.step('Post-condition: After each test', async () => {
            Logger.step('Post-condition: After each test');
            // logic
            Logger.info(`[AFTER METHOD] [${testName}] [SETUP ACTION]: END...`);
        });
    },
    singleTestDataProvider: async ({ }, use, testInfo) => {
        Constants.SET_CURRENT_STEP_CONTEXT(testInfo);
        const testName = testInfo.title;
        const testDataFileName = 'testData.json';
        const testDirPath = path.dirname(testInfo.file);
        const testDataFilePath = path.join(testDirPath, testDataFileName);

        const fileContent = readFileSync(testDataFilePath, 'utf-8');
        const data: Record<string, Record<string, any>[]> = JSON.parse(fileContent);
        const testSpecificData = data[testName] || {};

        await test.step(`Data Provider: Load test data for ${testName}`, async () => {
            if (testSpecificData.length === 0) {
                Logger.warn(`[BEFORE METHOD] [${testName}] [DATA PROVIDER]: No specific test data found for ${testName} in ${testDataFileName}`);
            } else {
                Logger.info(`[BEFORE METHOD] [${testName}] [DATA PROVIDER]: Loaded test data for ${testName}`);
                Logger.info(`[BEFORE METHOD] [${testName}] [DATA PROVIDER]: Specific test data for ${testName}: ${JSON.stringify(testSpecificData[0])}`);
            }
        });

        await use(testSpecificData[0]);
    },
    dataProviderForAllTests: async ({ }, use, testInfo) => {
        Constants.SET_CURRENT_STEP_CONTEXT(testInfo);
        const testDataFileName = 'testData.json';
        const testDirPath = path.dirname(testInfo.file);
        const testDataFilePath = path.join(testDirPath, testDataFileName);

        const fileContent = readFileSync(testDataFilePath, 'utf-8');
        const data: Record<string, Record<string, any>[]> = JSON.parse(fileContent);

        await test.step(`Data Provider: Load test data`, async () => {
            if (Object.keys(data).length === 0) {
                Logger.warn(` [DATA PROVIDER]: No specific test data found in ${testDataFileName}`);
            } else {
                Logger.info(`[DATA PROVIDER]: Specific test data: ${JSON.stringify(data)}`);
            }
        });

        await use(data);
    },
    pageWithPreparedCred: async ({ browser }, use, testInfo) => {
        const fileUtils = new FileUtils();
        const userAliasToUse: string = await fileUtils.getFreeCredentialToRunTest();
        let context: BrowserContext | null = null;
        let page: Page | null = null;
        try {
            testInfo.annotations.push({ type: 'userAlias', description: String(userAliasToUse) });
            Constants.SET_CURRENT_STEP_CONTEXT(testInfo);

            Logger.info(`Using credential alias: ${userAliasToUse}`);
            context = await browser.newContext({ storageState: await fileUtils.getTempStorageStateJsonPath(userAliasToUse) });
            page = await context.newPage();
            // Test runs here
            await use(page);
        } catch (error) {
            throw error;
        } finally {
            // Must always execute after each test (method)
            // Must release the cred
            await fileUtils.releaseBeingUsedCredential(userAliasToUse);
            if (page) await page.close();
            if (context) await context.close();
        }
    },
    contextWithPreparedCred: async ({ browser }, use, testInfo) => {
        const fileUtils = new FileUtils();
        const userAliasToUse: string = await fileUtils.getFreeCredentialToRunTest();
        let context: BrowserContext | null = null;
        let page: Page | null = null;
        try {
            testInfo.annotations.push({ type: 'userAlias', description: String(userAliasToUse) });
            Constants.SET_CURRENT_STEP_CONTEXT(testInfo);

            Logger.info(`Using credential alias: ${userAliasToUse}`);
            context = await browser.newContext({ storageState: await fileUtils.getTempStorageStateJsonPath(userAliasToUse) });
            page = await context.newPage();
            // Test runs here
            await use(context);
        } catch (error) {
            throw error;
        } finally {
            // After each test (method)
            // Must release the cred
            await fileUtils.releaseBeingUsedCredential(userAliasToUse);
            if (page) await page.close();
            if (context) await context.close();
        }
    },

    // browsers with prepared auth data
    checkoutPage: async ({ pageWithPreparedCred }, use) => { await use(new CheckoutPage(pageWithPreparedCred)); },
    homePage: async ({ pageWithPreparedCred }, use) => { await use(new HomePage(pageWithPreparedCred)); },
    loginPage: async ({ pageWithPreparedCred }, use) => { await use(new LoginPage(pageWithPreparedCred)); },
    myAccountPage: async ({ pageWithPreparedCred }, use) => { await use(new MyAccountPage(pageWithPreparedCred)); },
    myCartPage: async ({ pageWithPreparedCred }, use) => { await use(new MyCartPage(pageWithPreparedCred)); },
    orderStatusPage: async ({ pageWithPreparedCred }, use) => { await use(new OrderStatusPage(pageWithPreparedCred)); },
    productDetailsPage: async ({ pageWithPreparedCred }, use) => { await use(new ProductDetailsPage(pageWithPreparedCred)); },
    productPage: async ({ pageWithPreparedCred }, use) => { await use(new ProductPage(pageWithPreparedCred)); },

    // clean context
    checkoutPageClean: async ({ page }, use) => { await use(new CheckoutPage(page)); },
    homePageClean: async ({ page }, use) => { await use(new HomePage(page)); },
    loginPageClean: async ({ page }, use) => { await use(new LoginPage(page)); },
    myAccountPageClean: async ({ page }, use) => { await use(new MyAccountPage(page)); },
    myCartPageClean: async ({ page }, use) => { await use(new MyCartPage(page)); },
    orderStatusPageClean: async ({ page }, use) => { await use(new OrderStatusPage(page)); },
    productDetailsPageClean: async ({ page }, use) => { await use(new ProductDetailsPage(page)); },
    productPageClean: async ({ page }, use) => { await use(new ProductPage(page)); },
});

export const expect = expectBase;


// If you want to re-use the same browser window, for multiple test data in a test --> use this
export class TestClassSetupAndTearDown {
    async basicSetup(testClassName: string, browserObject: Browser, performLogin: boolean = false): Promise<Map<string, any>> {
        const returnedRecord: Map<string, any> = new Map();
        Logger.info(`[BEFORE CLASS ${testClassName}]: START...`);
        const newContext = await browserObject.newContext();
        const newPage = await newContext.newPage();
        const homePage = new HomePage(newPage);
        await homePage.navigateToTestSite();
        if (performLogin) {
            await homePage.clickLoginLink();
            await new LoginPage(newPage).login();
        }
        Logger.info(`[BEFORE CLASS ${testClassName}]: END...`);

        returnedRecord.set('context', newContext);
        returnedRecord.set('page', newPage);
        return returnedRecord;
    }

    async basicTeardown(testClassName: string, browserContextArg: BrowserContext, pageArg: Page) {
        Logger.info(`[AFTER CLASS ${testClassName}]: START...`);
        await pageArg.close();
        await browserContextArg.close();
        Logger.info(`[AFTER CLASS ${testClassName}]: END...`);
    }
}
