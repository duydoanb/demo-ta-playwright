import path from 'path';
import { readFileSync } from 'fs';
import { test as baseTest, expect as expectBase } from '@playwright/test';
import { HomePage } from '../pages/homePage';

// Define the types for your fixtures
export type MyFixtures = {
    setupAction: Record<string, any>,
    singleTestDataProvider: Record<string, any>,
    dataProviderForAllTests: Record<string, Record<string, any>[]>
};

// Extend the base test
export const test = baseTest.extend<MyFixtures>({
    setupAction: async ({ page }, use, testInfo) => {
        const setupAction = new Map<string, any>();
        const homePage = new HomePage(page);
        const testName = testInfo.title;

        // This runs BEFORE each test (Like @BeforeMethod)
        await test.step('Pre-condition: Navigate to the main page', async () => {
            console.log(`[BEFORE METHOD] [${testName}] [SETUP ACTION]: START...`);
            await homePage.navigateToTestSite();
            console.log(`[BEFORE METHOD] [${testName}] [SETUP ACTION]: END...`);
        });

        setupAction.set('homePage', homePage);
        setupAction.set('testInfo', testInfo);
        await use(setupAction); // The test runs here

        // Logic after use() runs AFTER each test (Like @AfterMethod)
        await test.step('Post-condition: After each test', async () => {
            console.log(`[AFTER METHOD] [${testName}] [SETUP ACTION]: START...`);
            // logic
            console.log(`[AFTER METHOD] [${testName}] [SETUP ACTION]: END...`);
        });
    },
    singleTestDataProvider: async ({ }, use, testInfo) => {
        const testName = testInfo.title;
        const testDataFileName = 'testData.json';
        const testDirPath = path.dirname(testInfo.file);
        const testDataFilePath = path.join(testDirPath, testDataFileName);

        const fileContent = readFileSync(testDataFilePath, 'utf-8');
        const data: Record<string, Record<string, any>[]> = JSON.parse(fileContent);
        const testSpecificData = data[testName] || {};

        await test.step(`Data Provider: Load test data for ${testName}`, async () => {
            if (testSpecificData.length === 0) {
                console.warn(`[BEFORE METHOD] [${testName}] [DATA PROVIDER]: No specific test data found for ${testName} in ${testDataFileName}`);
            } else {
                console.log(`[BEFORE METHOD] [${testName}] [DATA PROVIDER]: Loaded test data for ${testName}`);
                console.log(`[BEFORE METHOD] [${testName}] [DATA PROVIDER]: Specific test data for ${testName}: ${JSON.stringify(testSpecificData[0])}`);
            }
        });

        await use(testSpecificData[0]);
    },
    dataProviderForAllTests: async ({ }, use, testInfo) => {
        const testDataFileName = 'testData.json';
        const testDirPath = path.dirname(testInfo.file);
        const testDataFilePath = path.join(testDirPath, testDataFileName);

        const fileContent = readFileSync(testDataFilePath, 'utf-8');
        const data: Record<string, Record<string, any>[]> = JSON.parse(fileContent);

        await test.step(`Data Provider: Load test data`, async () => {
            if (Object.keys(data).length === 0) {
                console.warn(` [DATA PROVIDER]: No specific test data found in ${testDataFileName}`);
            } else {
                console.log(`[DATA PROVIDER]: Specific test data: ${JSON.stringify(data)}`);
            }
        });

        await use(data);
    }
});

export const expect = expectBase;