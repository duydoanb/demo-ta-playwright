import { defineConfig, devices } from '@playwright/test';
import { DataUtils } from './utils/utilities';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });
const suiteStartTimeStamp = DataUtils.getCurrentLocalISOTimeStamp();
process.env.TEST_RUN_ID = `${process.env.CI ? "CI" : "local"}-${suiteStartTimeStamp}`;
// console.log(`[PW config.ts file] process.env.TEST_RUN_ID = ${process.env.TEST_RUN_ID}`);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  globalSetup: require.resolve('./fixtures/suite.setup.ts'),
  globalTeardown: require.resolve('./fixtures/suite.teardown.ts'),
  globalTimeout: 60 * 60 * 1000,
  timeout: 2 * 60 * 1000,

  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Set retry */
  retries: process.env.CI ? 4 : (process.env.DEBUG_MODE === 'true') ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? (process.env.USE_TEST_SHARDING === 'true') ? 1 : 5 : 3,
  maxFailures: process.env.CI ? 5 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [['blob'], ['html'], ['allure-playwright', { detail: true, resultsDir: `allure-results/${process.env.TEST_RUN_ID}/`, suiteTitle: true }]]
    : [['html', { open: 'on-failure' }], ['list'], ['allure-playwright', { detail: true, resultsDir: `allure-results/${process.env.TEST_RUN_ID}/`, suiteTitle: true }], ['junit', { outputFile: `junit-reports/${process.env.TEST_RUN_ID}/junit-results.xml` }]],
  preserveOutput: 'failures-only',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: process.env.BASE_URL!,
    testIdAttribute: 'data-id',

    actionTimeout: 15 * 1000,
    navigationTimeout: 25 * 1000,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-all-retries',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    launchOptions: {
      slowMo: process.env.CI ? 0 : 100,
    }
  },
  metadata: {
    title: 'Regression tests',
    'revision.link': process.env.BASE_URL,
    'revision.id': process.env.TEST_RUN_ID,
    'revision.author': 'Duy Doan',
    'timestamp': suiteStartTimeStamp,
  },

  /* Configure projects for major browsers */
  projects: [
    { name: 'setup authentication', testMatch: /test-setup\/auth.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup authentication'],
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'], },
    //   dependencies: ['setup authentication'],
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    //   dependencies: ['setup authentication'],
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'], isMobile: true },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     ...devices['Desktop Edge'],
    //     channel: 'msedge'
    //   },
    //   dependencies: ['setup authentication'],
    // },
    // {
    //   name: 'Google Chrome',
    //   use: {
    //     ...devices['Desktop Chrome'],
    //     channel: 'chrome'
    //   },
    //   dependencies: ['setup authentication'],
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
