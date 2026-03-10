# Playwright Automation Framework

A scalable UI test automation framework built with [Playwright](https://playwright.dev/) and TypeScript.

## Overview

This project follows a conventional Playwright framework structure with:

- Page Object Model (POM) under `pages/`
- Test fixtures and lifecycle hooks under `fixtures/`
- Data-driven tests using `testData.json` files in each test module
- Multi-reporter output: HTML, List, JUnit XML, and Allure
- CI execution via GitHub Actions (`.github/workflows/playwright.yml`)

## Tech Stack

- `@playwright/test`
- TypeScript
- `dotenv`
- `allure-playwright`

## Project Structure

```text
.
|-- fixtures/                 # Custom test fixtures + global setup/teardown
|-- pages/                    # Page objects
|-- tests/                    # Test specs grouped by feature
|   |-- purchase/
|   |-- products/
|   `-- orders/
|-- data-objects/             # DTOs / enums used by tests
|-- utils/                    # Test utilities and data loaders
|-- playwright.config.ts      # Playwright configuration
`-- .github/workflows/        # CI pipeline
```

## Prerequisites

- Node.js 18+ (recommended)
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
# Add any other environment-specific values used by your pages/tests
```

`playwright.config.ts` reads this file automatically.

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

## Framework Conventions

- Use page objects for all UI interactions.
- Keep assertions in tests or page-level validation methods.
- Keep test data in module-level `testData.json` files.
- Use `test.step()` for readable reporting and traceability.
- Use custom fixtures from `fixtures/beforeAndAfterTest.ts` for common setup.

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

- `.github/workflows/playwright.yml`

Typical CI flow:

1. Install dependencies
2. Install Playwright browsers
3. Execute tests
4. Publish test artifacts/reports

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

