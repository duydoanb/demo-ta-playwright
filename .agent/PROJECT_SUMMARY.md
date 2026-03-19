# Project Summary: demo-ta-playwright

## Purpose
Playwright-based UI automation framework with Page Object Model, data-driven tests, fixtures that mimic TestNG lifecycle hooks, credential leasing to avoid parallel data conflicts, and CI execution with optional test sharding and report merging.

## Tech Stack
- Playwright Test (`@playwright/test`)
- TypeScript (configured by `type: commonjs` in `package.json`)
- dotenv for environment loading
- Allure reporting via `allure-playwright`
- Credential leasing with `proper-lockfile`

## Environment and Secrets
- `.env` is loaded in `playwright.config.ts` with `dotenv.config()`.
- Required variables: `BASE_URL`, `VALID_USERNAME_1`, `VALID_PASSWORD_1`, `VALID_CREDENTIALS` (JSON array).
- Optional variables: `DEBUG_MODE` (disables retries locally).
- Credentials are currently stored in `.env` in plaintext (risk for shared repos).

## Playwright Configuration
File: `playwright.config.ts`

Key settings:
- `globalSetup`: `fixtures/suite.setup.ts`
- `globalTeardown`: `fixtures/suite.teardown.ts`
- Timeouts: `globalTimeout` 1h, test `timeout` 2m
- `retries`: CI=3, local=2 (0 when `DEBUG_MODE=true`)
- `workers`: CI=1 when `USE_TEST_SHARDING=true`, else 6; local=5
- `maxFailures`: CI=5
- `reporter`:
  - CI: `blob`, `html`, `allure-playwright` (detailed)
  - Local: `html`, `list`, `allure-playwright`, `junit`
- Artifacts: traces, screenshots, videos only on retries/failures
- Projects:
  - `setup authentication` (auth storage state generation)
  - `chromium` project depends on `setup authentication`

## Auth and Storage State
File: `tests/test-setup/auth.setup.ts`

- Generates or reuses a `storageState` file per credential alias.
- Validates cookie age and expires after a threshold (`Constants.AUTH_DATA_LIFETIME_THRESHOLD`).
- Persists storage states to `.temp-storage-state-data/.auth/<alias>.json`.
- Initializes `.temp-storage-state-data/.auth/credential_usage_status.json` for credential leasing.

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
- `credential.ts`: credential DTO for login/storage state.
- `dataEnums.ts`: `PaymentMethod`, `ProductSortMode`, `MenuTab`.
- `dataEnums.ts` also contains product view/department/show-limit enums and `CredentialUsageStatus`.

## Utilities
Folder: `utils/`

- `testDataLoader.ts`: loads `testData.json` based on current test path; helper for class name resolution.
- `constants.ts`:
  - stores env-backed credentials
  - holds auth storage paths and credential usage file name
  - centralizes auth lifetime threshold
  - exposes test-class setup/teardown instance
- `utilities.ts`:
  - `FileUtils` provides credential leasing with file locks and storageState paths
  - `ActionUtils` encapsulates an end-to-end order flow
  - `DataUtils` provides price/quantity helpers

## Tests
Folder: `tests/`

- `purchase/TC_01..TC_03, TC_06..TC_09.spec.ts`:
  - purchase flows (including guest vs authenticated scenarios)
  - data-driven via `tests/purchase/testData.json`
  - uses credential leasing + storageState for parallel-safe auth
- `products/TC_04.spec.ts`:
  - product sorting validation
  - data-driven via `tests/products/testData.json`
  - uses credential leasing + storageState
- `orders/TC_05.spec.ts`:
  - order history validation
  - uses credential leasing + storageState

## CI/CD
Files: `.github/workflows/playwright-non-sharding.yml`, `.github/workflows/playwright-sharding.yml`

- Non-sharding workflow runs on `pull_request` for `main`/`develop` and executes a single Playwright run.
- Sharding workflow is wired to `main-unused`/`develop-unused` branches and runs 4 shards.
- Both workflows upload Allure results; sharding workflow merges blob and Allure reports.

## Reports and Artifacts
- HTML report: `playwright-report/`
- JUnit XML: `test-results/junit-results.xml` (local reporter only)
- Allure results: `allure-results/`
- Blob reports for sharding: `blob-report/`

## Package Scripts
- `package.json` currently has no `scripts` section entries.

## Notable Implementation Details
- Uses `storageState` per credential alias to reuse authenticated sessions.
- `basicSetupAction` performs login if the login link is visible.
- Test data is co-located per test module (`testData.json`).
- Credential leasing avoids parallel test data conflicts by locking a shared status file.
- Test sharding is enabled in CI when `USE_TEST_SHARDING=true`.

## Known Gaps (from tests/goals.txt)
- Jenkins integration: in progress
