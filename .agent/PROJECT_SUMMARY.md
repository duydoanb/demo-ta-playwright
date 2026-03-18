# Project Summary: demo-ta-playwright

## Purpose
Playwright-based UI automation framework with Page Object Model, data-driven tests, fixtures that mimic TestNG lifecycle hooks, and CI execution with test sharding and report merging.

## Tech Stack
- Playwright Test (`@playwright/test`)
- TypeScript (configured by `type: commonjs` in `package.json`)
- dotenv for environment loading
- Allure reporting via `allure-playwright`

## Environment and Secrets
- `.env` is loaded in `playwright.config.ts` with `dotenv.config()`.
- Required variables: `BASE_URL`, `VALID_USERNAME`, `VALID_PASSWORD`.
- Credentials are currently stored in `.env` in plaintext (risk for shared repos).

## Playwright Configuration
File: `playwright.config.ts`

Key settings:
- `globalSetup`: `fixtures/suite.setup.ts`
- `globalTeardown`: `fixtures/suite.teardown.ts`
- Timeouts: `globalTimeout` 1h, test `timeout` 2m
- `retries`: CI=2, local=1
- `workers`: CI=3 unless `USE_TEST_SHARDING`, local=2
- `reporter`:
  - CI: `blob`, `html`, `allure-playwright`
  - Local: `html`, `list`, `allure-playwright`, `junit`
- Artifacts: traces, screenshots, videos only on retries/failures
- Projects:
  - `setup` (suite setup)
  - `setup authentication` (auth storage state generation)
  - `teardown` (suite teardown)
  - `chromium` project uses `storageState` from `.temp-storage-state-data/.auth/user.json`

## Auth and Storage State
File: `tests/test-setup/auth.setup.ts`

- Generates or reuses a `storageState` file.
- Validates cookie age and expires after a threshold (`Constants.AUTH_DATA_LIFETIME_THRESHOLD`).
- Persists storage state to `Constants.TEMP_LOGIN_STATE_FILE_PATH`.

## Fixtures and Lifecycle
File: `fixtures/beforeAndAfterTest.ts`

Custom fixtures:
- `basicSetupAction`: navigate to base URL and login if login link is visible.
- `singleTestDataProvider` and `dataProviderForAllTests`: load test data from `testData.json` in each test folder.

Test-class setup/teardown helper:
- `TestClassSetupAndTearDown.basicSetup()` creates a separate context/page per test class and optionally logs in.
- Used in tests to reduce repeated navigation and improve runtime.

## Page Objects
Folder: `pages/`

- `basePage.ts`: common navigation, menu, cookies/banner dismissal.
- `homePage.ts`: login link handling.
- `loginPage.ts`: login action using `Constants.VALID_USERNAME/PASSWORD`.
- `productPage.ts`: sorting, view mode, price parsing, add-to-cart.
- `myCartPage.ts`: proceed-to-checkout with retry/reload.
- `checkoutPage.ts`: billing form and payment selection.
- `orderStatusPage.ts`: order confirmation validations.
- `myAccountPage.ts`: orders history navigation and order ID extraction.

## Data Objects and Enums
Folder: `data-objects/`

- `billingInfo.ts`: data model for checkout inputs.
- `dataEnums.ts`: `PaymentMethod`, `ProductSortMode`, `MenuTab`.

## Utilities
Folder: `utils/`

- `testDataLoader.ts`: loads `testData.json` based on current test path; helper for class name resolution.
- `constants.ts`:
  - stores env-backed credentials
  - holds auth storage path
  - centralizes auth lifetime threshold
  - exposes test-class setup/teardown instance

## Tests
Folder: `tests/`

- `purchase/TC_01.spec.ts`:
  - end-to-end purchase flow
  - uses class-level setup with a dedicated context/page
  - data-driven via `tests/purchase/testData.json`
- `products/TC_04.spec.ts`:
  - product sorting validation
  - data-driven via `tests/products/testData.json`
- `orders/TC_05.spec.ts`, `TC_06.spec.ts`, `TC_07.spec.ts`, `TC_08.spec.ts`:
  - order history sorting validation
  - uses `basicSetupAction` fixture

## CI/CD
File: `.github/workflows/playwright.yml`

- Runs on `push` and `pull_request` for `main` and `develop`.
- Shards tests across 4 runners (`--shard=1/4..4/4`).
- Uploads blob and Allure results per shard.
- Merges blob reports and generates HTML report in a second job.

## Reports and Artifacts
- HTML report: `playwright-report/`
- JUnit XML: `test-results/junit-results.xml` (local reporter only)
- Allure results: `allure-results/`
- Blob reports for sharding: `blob-report/`

## Package Scripts
- `package.json` currently has no `scripts` section entries.

## Notable Implementation Details
- Uses `storageState` in Playwright config to reuse authenticated sessions.
- `basicSetupAction` performs login if the login link is visible.
- Test data is co-located per test module (`testData.json`).
- Test sharding is enabled in CI when `USE_TEST_SHARDING=true`.

## Known Gaps (from tests/goals.txt)
- Implement 10 test cases: in progress
- Jenkins integration: in progress
