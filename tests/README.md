# Tests

All automated tests of My Trip Planner. Each suite is its own project with its own `package.json`. The test plan and the work tracking are outside the repository:

- Test plan: [Wiki - Test Plan](https://github.com/rafaabc/trip-planner/wiki/Test-Plan)
- Work tracking: [GitHub Project board](https://github.com/users/rafaabc/projects/2)

| Suite | Folder | Tools | Needs |
|---|---|---|---|
| API | `tests/api/` | Mocha, Chai, Supertest, Mochawesome | The backend running |
| UI | `tests/e2e/` | Playwright, playwright-bdd (Gherkin), TypeScript, Allure | Nothing: Playwright starts the backend and the website |
| Performance | `tests/performance/` | Artillery | The backend running, Node.js 22.18 or newer |

Exploratory sessions, security and accessibility checks are recorded as comments on the GitHub issues of each user story. Bugs are issues with the `bug` label, and each one has a guardrail test tagged `@bug #<issue>` that fails on purpose until the bug is fixed.

## Test environment variables

| File | Variable | Description |
|---|---|---|
| `tests/api/.env` | `BASE_URL` | API under test (default `http://localhost:3000`) |
| `tests/api/.env` | `JWT_SECRET` | Same value the API runs with. Only the expired-token test needs it; without it that test is skipped. CI sets it for the whole workflow |
| `tests/e2e/.env` | `BASE_URL` | Website under test (default `http://localhost:5173`) |
| `tests/e2e/.env` | `API_URL` | API used for test preconditions (default `http://localhost:3000`) |

## Running the API tests

The API tests live in their own project, `tests/api/`, and call the running API. Start the backend first, then:

```bash
cd tests/api
npm install
cp .env.example .env
npm test
```

| Script | Description |
|---|---|
| `npm test` | Run the suite with the spec reporter |
| `npm run test:report` | Run the suite and write an HTML report to `tests/api/reports/report.html` |
| `npm run lint` | Lint with ESLint |
| `npm run format:check` | Check formatting with Prettier |
| `npm run audit` | `npm audit` for high severity issues |

Fourteen tests (tagged `@bug #19`, `@bug #20`, `@bug #44`, `@bug #45`, `@bug #56` and `@bug #65`) describe the expected behavior of open bugs and **fail on purpose** until the bugs are fixed. To run everything except them, or only them:

```bash
npm run test:report -- --grep "@bug" --invert   # without the known-bug guardrails
npm run test:report -- --grep "@bug"            # only the known-bug guardrails
```

## Running the UI tests

The UI tests live in `tests/e2e/`. Scenarios are written in Gherkin (`features/*.feature`), bound to code by step definitions (`steps/`), and drive the website through page objects (`pages/`). Playwright starts the backend and the built website itself (and reuses them if already running), so there is nothing to start by hand:

```bash
cd tests/e2e
npm install
npx playwright install chromium
cp .env.example .env
npm test
```

| Script | Description |
|---|---|
| `npm test` | Generate the Playwright tests from the `.feature` files and run them in Chromium |
| `npm run test:headed` | Same, with a visible browser |
| `npm run test:stability` | Run every scenario twice (a test only counts as done after two green runs) |
| `npm run report:html` | Open the Playwright HTML report |
| `npm run report:allure` | Build and open the Allure report from `allure-results/` |
| `npm run lint` | Lint with ESLint (no fixed waits) |
| `npm run format:check` | Check formatting with Prettier |
| `npm run typecheck` | Type check with TypeScript |
| `npm run audit` | `npm audit` for high severity issues |

Every scenario carries the user story tag (`@US-01`) and, when it comes from the test plan, the test case key (`@TC-01-06`). Locally the suite runs with 3 workers: with the default of 6, the first parallel wave of browsers made some tests miss the 5 s assertion timeout on a cold start.

## Running the performance tests

The performance tests live in `tests/performance/` and use [Artillery](https://www.artillery.io/). Each scenario is a YAML file in `scenarios/` (one file per user story). They call the running API, so start the backend first, then:

```bash
cd tests/performance
npm install
npm test
```

| Script | Description |
|---|---|
| `npm test` | Run every scenario, one after the other, and write one JSON report each to `tests/performance/reports/` |
| `npm run test:register` | Run only `scenarios/register.yml` (report in `reports/register.json`) |
| `npm run test:login` | Run only `scenarios/login.yml` (report in `reports/login.json`) |
| `npm run test:trips` | Run only `scenarios/trips.yml` (report in `reports/trips.json`) |
| `npm run test:items` | Run only `scenarios/items.yml` (report in `reports/items.json`) |
| `npm run test:dashboard` | Run only `scenarios/dashboard.yml` (report in `reports/dashboard.json`) |
| `npm run format:check` | Check formatting with Prettier |
| `npm run audit` | `npm audit` for high severity issues |

`scenarios/register.yml` (US-01 Sign Up) registers one new user per second for 30 seconds, about 30 requests. Requests do not overlap, so each one measures the endpoint and not a queue behind the password hashing. The run fails (non-zero exit code) when the p95 response time is not under 500 ms, the limit from the test plan, or when any response is not `201`. Min, mean, median, p95, p99 and max are printed and saved in the report as information.

`scenarios/login.yml` (US-02 Log In) logs in once per second for 30 seconds with the seed user, about 30 requests. The test plan asks for a single request, but one sample makes every statistic the same value, so 30 requests give a p95 that means something while keeping the same limit. The run fails when the p95 response time is not under 500 ms or when any response is not `200`.

`scenarios/trips.yml` (US-03 Manage Trip Budgets) lists the trips of a user who has 100 trips, once per second for 30 seconds, about 30 requests. Before the load starts, `helpers/trips.js` creates the user and the 100 trips; those setup requests are not measured, only the list requests are. The run fails when the p95 response time is not under 500 ms, when any response is not `200`, or when a list does not return exactly 100 trips.

`scenarios/items.yml` (US-04 Manage Budget Items) lists the items of a trip that has 200 items, once per second for 30 seconds, about 30 requests. Before the load starts, `helpers/items.js` creates the user, the trip and the 200 items; those setup requests are not measured, only the list requests are. The run fails when the p95 response time is not under 500 ms, when any response is not `200`, or when a list does not return exactly 200 items.

`scenarios/dashboard.yml` (US-05 View Trip Dashboard) reads the dashboard of a 6-day trip that has 200 items, once per second for 30 seconds, about 30 requests. Before the load starts, `helpers/dashboard.js` creates the user, the trip and the 200 items; those setup requests are not measured, only the dashboard requests are. The run fails when the p95 response time is not under 500 ms, when any response is not `200`, or when the grand total, a category total, the number of days, the daily total or the per-day value is not the expected one (calculated in the helper from the 200 items, not taken from the API).

To test another server, pass the target to one scenario: `npm run test:login -- --target http://localhost:4000`. Artillery sends anonymous usage data by default; the scripts turn that off.

## Continuous integration

The API and UI workflows are skipped when a change touches only Markdown files (`**/*.md`, for example the README), because there is nothing to test. A change that touches anything else, including the workflow files themselves, runs them.

The workflow `.github/workflows/ui-tests.yml` runs the UI tests on every pull request to `main` and on every push to `main`:

| Job | Blocks the merge | What it does |
|---|---|---|
| Lint, format, types and audit | Yes | `npm run lint`, `format:check`, `typecheck` and `audit` in `tests/e2e` |
| UI tests (Chromium) | Yes | Installs Chromium and runs every scenario except `@bug` ones (none yet) |

The Playwright report and the Allure results are uploaded as workflow artifacts.

The workflow `.github/workflows/api-tests.yml` runs on every pull request to `main` and on every push to `main`. It starts the backend and runs three jobs in parallel:

| Job | Blocks the merge | What it does |
|---|---|---|
| Lint, format and audit | Yes | `npm run lint`, `npm run format:check` and `npm run audit` in `tests/api` |
| API tests | Yes | Starts the backend and runs every test except the `@bug` guardrails |
| Known-bug guardrails (non-blocking) | No | Runs only the `@bug` tests, which fail until bugs #19, #20, #44, #45, #56 and #65 are fixed |

The Mochawesome HTML report of each test job is uploaded as a workflow artifact.

The workflow `.github/workflows/performance-tests.yml` is different, because response times on shared runners change from run to run:

| Trigger | Job | What it does |
|---|---|---|
| Pull request that changes `tests/performance/**` or the workflow | Format and audit | `npm run format:check` and `npm run audit` in `tests/performance` |
| Manual (Actions tab, Run workflow) | Performance tests | Starts the backend, runs the Artillery scenarios and uploads the JSON report |

The timing test never runs on its own, so it cannot block a merge.

## Deployed test environment (Vercel)

The app is deployed to two Vercel projects, so it can be opened and tested without running anything locally:

| Part | Vercel project | URL |
|---|---|---|
| Frontend | `trip-planner-frontend` (root `frontend/`) | https://trip-planner-frontend-flax.vercel.app |
| API | `trip-planner-backend` (root `/`) | https://trip-planner-backend-iota.vercel.app (docs at `/api-docs`) |

- `api/index.js` is the Vercel entrypoint: it seeds the in-memory store and exports the Express app. Locally the API still starts with `npm start`.
- The API needs `JWT_SECRET` as a Vercel environment variable. The frontend is built with `VITE_API_URL` pointing at the API URL.
- It is a test environment, not production. The API keeps its data in memory and runs as serverless functions, so data can disappear between requests. A failure caused by that is a finding, not a reason to change the tests or the limits.

Run a suite against it by changing the target:

| Suite | Command (from the suite folder) |
|---|---|
| API | `BASE_URL=<api url> npm test` (the expired-token test also needs the same `JWT_SECRET` the API runs with, or it is skipped) |
| UI | `BASE_URL=<frontend url> API_URL=<api url> npm test` (Playwright starts no local server when `BASE_URL` is not localhost) |
| Performance | `npm run test:login -- --target <api url>` (same for `test:register`, `test:trips`, `test:items` and `test:dashboard`) |

The API case `@local-only` (TC-02-05, token with `alg: none`) is skipped on the deployed environment: the Vercel firewall answers `403 Forbidden` before the request reaches the app, so only a local run can verify how the app handles that token.

The workflow `.github/workflows/deployed-tests.yml` runs all three suites against the deployed environment. It runs only manually (Actions tab, Run workflow) and needs the repository secret `TEST_ENV_JWT_SECRET`. It never runs on a pull request and must not be made a required check.
