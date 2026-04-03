---
name: automation-qa
description:
  1. Build, scale and maintain automated QA testing for web or API apps.
  2. Use this when asked to create or update test plans, write or refactor automated tests, add regression/smoke suites, stabilize flaky tests, improve selectors/fixtures in Playwright

compatibility:
  1. Node.js 24+, npm, npx
  2. playwright@latest, its browsers
  3. playwright-cli@latest

metadata:
  author: Duy Doan
  version: "1.1"
---
# Automation QA

## Overview
- Provide automation QA support:
  - Assess the product and stack, design reliable test coverage, implement tests and fixtures, and integrate execution/reporting into CI.
  - Prefer maintainable, deterministic tests with clear selectors, isolated data, and actionable failure output.

## Quick Start
1. This project is a web-based automation framework using Playwright.
2. Environment variables are defined in the `.env` file.

### Application overview
1. Homepage URL: https://demo.testarchitect.com/
2. Use `playwright-cli` (prefer in headed mode) to explore the site and capture elements for new tests.
3. If login is needed:
   - Go to https://demo.testarchitect.com/my-account/
   - Always use this credential: dudu1236@sharklasers.com/Ahihi@1234
4. This is an e-commerce web app; key features include purchasing products and tracking orders.

## Workflow
1. Triage the request.
   - Identify feature areas, priorities (smoke vs regression), and risk.
   - Ask for missing inputs only if they block test execution (URLs, credentials, test data).
2. Read the automation surface.
   - All existing tests are in `./tests/`.
   - All configs and fixtures are in `./fixtures/` and `playwright.config.ts`.
   - Use existing helper utilities and patterns if available; avoid creating new functions.
3. Design coverage.
   - Map user flows to test cases.
   - Define a minimal smoke set first, then extend to regression.
4. Implement.
   - Use stable selectors, rank order: ByRole >> ByTestId >> By CSS selector >> getByText.
   - Deterministic data, and clear assertions.
   - Isolate tests and avoid inter-test coupling.
5. Stabilize.
   - Diagnose flakiness, add explicit waits only when necessary, and avoid arbitrary sleeps.
6. Report.
   - Summarize added/modified tests, how to run them, and expected outcomes.

## Test Design Guidelines
- When using this skill, make sure to read the file `.agent\PROJECT_SUMMARY.md` first if you have foggoten its content
- When inspecting UI, use `playwright-cli open <url> --headed` and capture a snapshot before selecting locators.
- When inspecting UI, always login using the provided credential unless the user ask to not to do that intentionally.
- DURING INSPECTING THE SITE: Login the site to get correct behaviours, BUT DON'T add codes to login in the test script as that is already handled.

- Always use the page-object-model design patterns to implement new tests.
- Always check all page classes in `./pages/` first to see if you really need a new class. If yes, follow the current design.
  - `.\pages\basePage.ts` is a base-frame for other page classes and its actions are general.
  - Do not edit `pages/basePage.ts` unless the user explicitly requests it.
  - Add new actions in other page classes in the `.\pages\` dir.
  - Page mapping:
    1. `homePage.ts`             --> displayed after opening the site
    2. `loginPage.ts`            --> displayed after clicking the Login / Sign up link in the top menu
    3. `productPage.ts`          --> displayed after clicking the Shop item in the main menu
    4. `productDetailsPage.ts`   --> displayed after clicking on a product or item in the product page (or Shop page)
    5. `myCartPage.ts`           --> displayed after clicking on the cart link on the top menu
    6. `checkoutPage.ts`         --> displayed after clicking Proceed to Checkout in the My Cart page
    7. `orderStatusPage.ts`      --> displayed after finishing payment in the checkout page; shows order info
    8. `myAccountPage.ts`        --> displayed after clicking the username link on the top menu

- Locators: 
   1. Always use stable selectors, prioritize: ByRole >> ByTestId >> By CSS selector >> getByText.
   2. AVOID USING INDEX in locator at all costs
   3. If dynamic locator for matching multiple elements is needed, do it like `productRowByProductName` and `removeProductLinkByProductName` in `myCartPage.ts` file, DO NOT create a private function just to return a locator
- Prefer prepared auth fixtures (`pageWithPreparedCred`) unless validating login flow or explicitly asked to log in.
- Credentials and fixtures are already set up, do not invent new ones unless the user asks.
- For tests that add products to cart or purchase items, empty the cart before each test.
- For tests with multiple datasets:
   1. Name each test as `${testCaseTitle} - ${testData.setNo}`
   2. Initiate tests using `for (...)` loop like tests in `tests/purchase/TC_01.spec.ts`, `tests/products/TC_04.spec.ts`
   3. Add test data into the file `testData.json` located at the same level, same dir as the test case file
      3.1. test data for a test in the `testData.json` MUST FOLLOW THIS STRUCTURE:
            ```
            "TC XX: ${Example test case name}": [
            {
                  "setNo": "dataset #1",
                  "data 1": "value 1",
                  "data 2": "value 2",
                  "data 3": "value 3"
            },
            {
                  "setNo": "dataset #2",
                  "data 1": "value 1",
                  "data 2": "value 2",
                  "data 3": "value 3"
            },
            {
                  "setNo": "dataset #3",
                  "data 1": "value 1",
                  "data 2": "value 2",
                  "data 3": "value 3"
            },
         ],```
- For assertions: 
   - *ALWAYS* create `verify/expect` methods in Page Objects to do assertions, validation
   - I don't wan't to see assertion method at the test file level
- Prefer black-box, user-visible checks over brittle internal state.
- Use `data-testid` or similarly stable attributes if available.
- Avoid time-based sleeps; wait on deterministic UI or network signals.
- Name tests after user behavior and expected outcome.

## Implementation Checklist
- Add or update fixtures and helpers to reduce duplication.
- Ensure tests are idempotent and clean up created data.
- Verify tests can run locally and pass.
- Document the exact test commands.
- Add a comment "THIS TEST IS GENERATED BY AGENT SKILLS!" at the end of the test.
- After implementing a test
   1. Run the test in headed mode to make sure it passes. If fails, fix the test till it pass.
   2. If existing methods in page object classes or somewhere else are modified, run the tests that are using them to make sure they all pass as well.
