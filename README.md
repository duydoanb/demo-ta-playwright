# Playwright Automation Framework

A scalable UI test automation framework built with [Playwright](https://playwright.dev/) and TypeScript.

## Overview

This project follows a conventional Playwright framework structure with:

- Page Object Model (POM) under `pages/`
- Test fixtures and lifecycle hooks under `fixtures/`
- Data-driven tests using `testData.json` files in each test module
- Auth storage state per credential, plus a credential pool to avoid parallel data conflicts
- Multi-reporter output: HTML, List, JUnit XML, Allure, and blob (for sharded CI)
- CI execution via GitHub Actions workflows in `.github/workflows/`

## Tech Stack

- `@playwright/test`
- TypeScript
- `dotenv`
- `allure-playwright`
- `proper-lockfile` (safe credential leasing across parallel workers)

## Project Structure

```text
.
|-- fixtures/                 # Custom test fixtures + global setup/teardown
|-- pages/                    # Page objects
|-- tests/                    # Test specs grouped by feature
|   |-- purchase/
|   |-- products/
|   |-- orders/
|   `-- test-setup/           # Auth/storage-state setup
|-- data-objects/             # DTOs / enums used by tests
|-- utils/                    # Test utilities and data loaders
|-- .temp-storage-state-data/ # Auth storage + credential usage file
|-- playwright.config.ts      # Playwright configuration
`-- .github/workflows/        # CI pipeline
```

## Prerequisites

- Node.js 20+ (required by package.json engines)
- npm 9+

## Installation

```bash
npm install
npx playwright install
```

## Environment Configuration

Create/update `.env` in the project root:

```env
BASE_URL=https://your-app-url
VALID_USERNAME_1=your-user
VALID_PASSWORD_1=your-pass
VALID_CREDENTIALS=[{"username":"user1","password":"pass1","alias":"user1"}]
DEBUG_MODE=false
```

`playwright.config.ts` reads this file automatically.

Notes:
- `VALID_CREDENTIALS` is a JSON array used to pre-generate storage states and lease credentials safely in parallel.
- Set `DEBUG_MODE=true` to disable retries locally.

## Run Tests

Run all tests:

```bash
npx playwright test
```

Run a specific spec file:

```bash
npx playwright test tests/purchase/TC_01.spec.ts
```

Run tests by title pattern:

```bash
npx playwright test -g "TC 01A"
```

Run on a specific project/browser:

```bash
npx playwright test --project=chromium
```

Run a shard locally (when `USE_TEST_SHARDING=true`):

```bash
set USE_TEST_SHARDING=true
npx playwright test --shard=1/4
```

Run in headed mode:

```bash
npx playwright test --headed
```

## Reporting

### Playwright HTML Report

```bash
npx playwright show-report
```

### Allure Report

Generate Allure report:

```bash
npx allure generate allure-results --clean -o allure-report
```

Open Allure report:

```bash
npx allure open allure-report
```

### JUnit Report

JUnit XML output is generated at:

```text
test-results/junit-results.xml
```

### Blob Report (CI Sharding)

When running in sharded CI, Playwright emits blob reports for merging:

```text
blob-report/
```

## Framework Conventions

- Use page objects for all UI interactions.
- Keep assertions in tests or page-level validation methods.
- Keep test data in module-level `testData.json` files.
- Use `test.step()` for readable reporting and traceability.
- Use custom fixtures from `fixtures/beforeAndAfterTest.ts` for common setup.
- Use credential leasing + storageState for parallel-safe authenticated tests.

## Data-Driven Pattern

Tests can load dataset entries and iterate them to create parameterized scenarios. This repository already uses that pattern in files like:

- `tests/purchase/TC_01.spec.ts`

## Debugging

Run with debug mode:

```bash
npx playwright test --debug
```

Open trace for failed tests:

```bash
npx playwright show-trace test-results/<trace-file>.zip
```

## CI

GitHub Actions workflow is available at:

- `.github/workflows/playwright-non-sharding.yml` (single job, uploads reports)
- `.github/workflows/playwright-sharding.yml` (4-way sharding + merged reports)

Typical CI flow:

1. Install dependencies
2. Install Playwright browsers
3. Execute tests
4. Publish test artifacts/reports

Note: The sharding workflow currently targets `main-unused`/`develop-unused` branches in the workflow file. Update branches if you want it to run on `main`/`develop`.

## Suggested npm Scripts

If you want shorter commands, add scripts in `package.json`:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "report": "playwright show-report",
    "allure:generate": "allure generate allure-results --clean -o allure-report",
    "allure:open": "allure open allure-report"
  }
}
```

## Best Practices

- Keep selectors resilient and centralized in page objects.
- Avoid hard waits; prefer Playwright auto-waiting and explicit assertions.
- Keep tests isolated and independent.
- Use retries for flaky external dependencies only; fix root causes when possible.
- Keep test data readable and version-controlled.

## Troubleshooting

Missing browser binaries:

```bash
npx playwright install
```

Environment variable not loaded:

- Ensure `.env` exists at project root.
- Ensure `BASE_URL` is defined.

Allure command not found:

```bash
npx allure --version
```

Tests will wait if no free credential available:
- Ensure `VALID_CREDENTIALS` contains enough users for your parallelism.
- Verify `.temp-storage-state-data/.auth/credential_usage_status.json` exists and is writable.

