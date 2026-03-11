import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
import { Constants } from './utils/constants';
dotenv.config({ path: path.resolve(__dirname, '.env') });

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
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Set retry */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? (process.env.USE_TEST_SHARDING ? 1 : 3) : 2,
  maxFailures: process.env.CI ? 5 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [['blob'], ['html'], ['allure-playwright', { detail: true, outputFolder: 'allure-results', suiteTitle: true }]]
    : [['html'], ['list'], ['allure-playwright', { detail: true, outputFolder: 'allure-results', suiteTitle: true }], ['junit', { outputFile: 'test-results/junit-results.xml' }]],
  preserveOutput: 'failures-only',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: process.env.BASE_URL!,

    actionTimeout: 10 * 1000,
    navigationTimeout: 20 * 1000,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-all-retries',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    launchOptions: {
      slowMo: 50,
    }
  },

  /* Configure projects for major browsers */
  projects: [
    { name: 'setup', testMatch: /suite.setup\.ts/ },
    { name: 'setup authentication', testMatch: /test-setup\/auth.setup\.ts/ },
    { name: 'teardown', testMatch: /suite.teardown\.ts/ },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: Constants.TEMP_LOGIN_STATE_FILE_PATH,
      },
      dependencies: ['setup', 'setup authentication'],
      teardown: 'teardown',
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    //   dependencies: ['setup'],
    //   teardown: 'teardown',
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    //   dependencies: ['setup'],
    //   teardown: 'teardown',
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
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    //   dependencies: ['setup'],
    //   teardown: 'teardown',
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    //   dependencies: ['setup'],
    //   teardown: 'teardown',
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
