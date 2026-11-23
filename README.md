# My Trip Planner

[![API Tests](https://github.com/rafaabc/trip-planner/actions/workflows/api-tests.yml/badge.svg?branch=main)](https://github.com/rafaabc/trip-planner/actions/workflows/api-tests.yml)
[![UI Tests](https://github.com/rafaabc/trip-planner/actions/workflows/ui-tests.yml/badge.svg?branch=main)](https://github.com/rafaabc/trip-planner/actions/workflows/ui-tests.yml)
[![Performance Tests](https://github.com/rafaabc/trip-planner/actions/workflows/performance-tests.yml/badge.svg?branch=main)](https://github.com/rafaabc/trip-planner/actions/workflows/performance-tests.yml)

> A simple web app and REST API to plan the budget of a trip, used as a testing-focused portfolio project.

## Description

My Trip Planner lets you create a trip ("Trip budget - City 1 - City 2") and fill in the amounts you expect to spend in each category. A dashboard shows the totals, the grand total and the daily budget. There are no external integrations: you research prices yourself and type them in. All money values are in **DKK**.

The backend is a Node.js + Express REST API with JWT authentication and an in-memory database (data resets on every restart). The frontend is a React + Vite website. The API is documented with an OpenAPI 3 file rendered by Swagger UI.

The project also contains the test work built around the application:

- Test plan: [Wiki - Test Plan](https://github.com/rafaabc/trip-planner/wiki/Test-Plan)
- Work tracking: [GitHub Project board](https://github.com/users/rafaabc/projects/2)
- Automated API tests: `tests/api/` (see [Installation and Setup](#installation-and-setup))
- Automated UI tests: `tests/e2e/` (see [Running the UI tests](#running-the-ui-tests))
- Automated performance tests: `tests/performance/` (see [Running the performance tests](#running-the-performance-tests))

## Dependencies

Install these before running the project:

- Node.js 20 or newer, with npm
- A free port `3000` (API) and `5173` (website)
- For the automated API tests: the backend must be running (see below)
- For the automated UI tests: nothing to start by hand, Playwright starts the backend and the website (Chromium is installed once with `npx playwright install chromium`)
- For the automated performance tests: Node.js 22.18 or newer (Artillery requirement) and the backend running (see below)

## Technologies Used

**Backend** (project root)

| Technology | Purpose |
|---|---|
| Express `^5.3.0` | REST API |
| jsonwebtoken `^9.0.3` | JWT authentication |
| bcryptjs `^3.0.3` | Password hashing |
| cors `^2.8.6` | Cross-origin requests |
| dotenv `^18.0.10` | Environment variables |
| swagger-ui-express `^5.0.1`, yaml `^2.9.1` | Render the OpenAPI file at `/api-docs` |
| nodemon `^3.1.14` | Auto-reload in development |

**Frontend** (`frontend/`)

| Technology | Purpose |
|---|---|
| React `^19.3.1` | UI |
| react-router-dom `^7.18.5` | Routing |
| Vite `^8.3.8`, @vitejs/plugin-react `^6.3.0` | Dev server and build |

**API tests** (`tests/api/`)

| Technology | Purpose |
|---|---|
| Mocha `^12.0.3` | Test runner |
| Chai `^4.5.0` | Assertions |
| Supertest `^7.0.0` | HTTP requests |
| Mochawesome `^8.1.1` | HTML and JSON test report |
| ESLint `^10.15.0`, eslint-plugin-mocha `^12.0.2` | Linting |
| Prettier `^3.10.1` | Formatting |
| GitHub Actions | CI: lint, format check, audit and tests on every pull request |

**UI tests** (`tests/e2e/`)

| Technology | Purpose |
|---|---|
| Playwright `^1.60.0` (Chromium only) | Browser automation and test runner |
| playwright-bdd `^9.2.1` | Turns Gherkin `.feature` files into Playwright tests |
| TypeScript `^5.9.0` | Page objects, step definitions and fixtures |
| allure-playwright `^3.4.0`, allure-commandline `^2.34.0` | Allure report |
| ESLint `^10.15.0`, eslint-plugin-playwright `^2.10.0` | Linting (bans fixed waits) |
| Prettier `^3.10.1` | Formatting |

**Performance tests** (`tests/performance/`)

| Technology | Purpose |
|---|---|
| Artillery `^2.0.34` | Load generation and response time statistics; scenarios are YAML files |
| cross-env `^10.1.0` | Sets the telemetry opt-out variable on every operating system |
| Prettier `^3.10.1` | Formatting |

## Installation and Setup

1. Install the backend and create its environment file (project root):

   ```bash
   npm install
   cp .env.example .env   # then set JWT_SECRET to any long random string
   ```

2. Install the frontend:

   ```bash
   cd frontend
   npm install
   cp .env.example .env
   ```

3. Start the backend and the frontend in two terminals:

   ```bash
   # Terminal 1 - API on http://localhost:3000
   npm start            # or: npm run dev (auto-reload)

   # Terminal 2 - website on http://localhost:5173
   cd frontend
   npm run dev
   ```

   The database is seeded with test data on every start.

### Environment variables

| File | Variable | Description |
|---|---|---|
| `.env` | `PORT` | API port (default `3000`) |
| `.env` | `JWT_SECRET` | Secret used to sign tokens. **Required.** |
| `.env` | `JWT_EXPIRES_IN` | Token lifetime, e.g. `2h` |
| `frontend/.env` | `VITE_API_URL` | API base URL (default `http://localhost:3000`) |
| `tests/api/.env` | `BASE_URL` | API under test (default `http://localhost:3000`) |
| `tests/api/.env` | `JWT_SECRET` | Same value the API runs with. Only the expired-token test needs it; without it that test is skipped. CI sets it for the whole workflow |
| `tests/e2e/.env` | `BASE_URL` | Website under test (default `http://localhost:5173`) |
| `tests/e2e/.env` | `API_URL` | API used for test preconditions (default `http://localhost:3000`) |

### Running the API tests

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

Ten tests (tagged `@bug #19`, `@bug #20`, `@bug #44`, `@bug #45` and `@bug #56`) describe the expected behavior of open bugs and **fail on purpose** until the bugs are fixed. To run everything except them, or only them:

```bash
npm run test:report -- --grep "@bug" --invert   # without the known-bug guardrails
npm run test:report -- --grep "@bug"            # only the known-bug guardrails
```

### Running the UI tests

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

### Running the performance tests

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
| `npm run format:check` | Check formatting with Prettier |
| `npm run audit` | `npm audit` for high severity issues |

`scenarios/register.yml` (US-01 Sign Up) registers one new user per second for 30 seconds, about 30 requests. Requests do not overlap, so each one measures the endpoint and not a queue behind the password hashing. The run fails (non-zero exit code) when the p95 response time is not under 500 ms, the limit from the test plan, or when any response is not `201`. Min, mean, median, p95, p99 and max are printed and saved in the report as information.

`scenarios/login.yml` (US-02 Log In) logs in once per second for 30 seconds with the seed user, about 30 requests. The test plan asks for a single request, but one sample makes every statistic the same value, so 30 requests give a p95 that means something while keeping the same limit. The run fails when the p95 response time is not under 500 ms or when any response is not `200`.

`scenarios/trips.yml` (US-03 Manage Trip Budgets) lists the trips of a user who has 100 trips, once per second for 30 seconds, about 30 requests. Before the load starts, `helpers/trips.js` creates the user and the 100 trips; those setup requests are not measured, only the list requests are. The run fails when the p95 response time is not under 500 ms, when any response is not `200`, or when a list does not return exactly 100 trips.

To test another server, pass the target to one scenario: `npm run test:login -- --target http://localhost:4000`. Artillery sends anonymous usage data by default; the scripts turn that off.

### Continuous integration

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
| Known-bug guardrails (non-blocking) | No | Runs only the `@bug` tests, which fail until bugs #19, #20, #44, #45 and #56 are fixed |

The Mochawesome HTML report of each test job is uploaded as a workflow artifact.

The workflow `.github/workflows/performance-tests.yml` is different, because response times on shared runners change from run to run:

| Trigger | Job | What it does |
|---|---|---|
| Pull request that changes `tests/performance/**` or the workflow | Format and audit | `npm run format:check` and `npm run audit` in `tests/performance` |
| Manual (Actions tab, Run workflow) | Performance tests | Starts the backend, runs the Artillery scenarios and uploads the JSON report |

The timing test never runs on its own, so it cannot block a merge.

### Deployed test environment (Vercel)

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
| Performance | `npm run test:login -- --target <api url>` (same for `test:register` and `test:trips`) |

The API case `@local-only` (TC-02-05, token with `alg: none`) is skipped on the deployed environment: the Vercel firewall answers `403 Forbidden` before the request reaches the app, so only a local run can verify how the app handles that token.

The workflow `.github/workflows/deployed-tests.yml` runs all three suites against the deployed environment. It runs only manually (Actions tab, Run workflow) and needs the repository secret `TEST_ENV_JWT_SECRET`. It never runs on a pull request and must not be made a required check.

### Test data

The database is seeded with these users. All passwords are for local testing only.

| User | Email | Password | Trip |
|---|---|---|---|
| Alice Jensen | `alice@example.com` | `alice123` | Copenhagen - Lisbon (2026-03-10 to 2026-03-15) |
| Bob Nielsen | `bob@example.com` | `bob12345` | Copenhagen - Rome (2026-06-20 to 2026-06-27) |
| Carla Hansen | `carla@example.com` | `carla123` | Aarhus - Barcelona (2026-09-05 to 2026-09-10) |

Each trip has budget items in all seven categories.

## Features

- Sign up and log in (JWT)
- Trip budget CRUD
- Budget item CRUD, per trip
- Dashboard with totals per category, grand total and daily budget
- Automated API tests for US-01 Sign Up (registration with valid data, missing fields, duplicate email, password never exposed)
- Automated API tests for US-02 Log In (valid and invalid credentials, protected endpoint with a valid, missing, malformed, altered or expired token)
- Automated API tests for US-03 Manage Trip Budgets (create with valid and boundary dates, update with an invalid date range, list only own trips, read, update and delete another user's trip)
- Automated API tests for US-04 Manage Budget Items (create with and without description, each allowed category, invalid category, amount 0, negative and non-numeric amount, list own items, list, create, update and delete in another user's trip)
- Automated UI tests for US-01 Sign Up (Playwright and Gherkin: valid sign-up, 6-character password, duplicate email, blank name, browser validation of each field)
- Automated UI tests for US-02 Log In (Playwright and Gherkin: login with valid credentials)
- Automated UI tests for US-03 Manage Trip Budgets (Playwright and Gherkin: create a trip through the website)
- Automated UI tests for US-04 Manage Budget Items (Playwright and Gherkin: create a budget item through the website)
- Continuous integration with GitHub Actions: quality gates, API tests and UI tests on every pull request

### Business rules

1. A user can create, list, update and delete a trip budget, named `Trip budget - [City 1] - [City 2]`. A trip has a start and an end date (end must not be before start).
2. Inside a trip, the user can create, list, update and delete budget items. Each item has a **category**, an **amount** in DKK (0 or more), and an optional **description**.
3. Allowed categories: `Flights`, `Accommodation`, `Activities`, `Food`, `Transport`, `Travel insurance`, `Extras`.
4. The dashboard shows, per trip, the **total per category**, the **grand total** and the **daily budget**, all in DKK. There is no sum across trips.
5. The **daily budget** is the amount to spend per day: (Activities + Food + Transport + Extras) divided by the number of trip days (start and end date both count). Pre-trip costs (Flights, Accommodation, Travel insurance) are not included. They still count in the category totals and the grand total.
6. Users only see and change their own trips. Another user's trip returns `404`.
7. Deleting a trip deletes its budget items.
8. All endpoints except register and login need an `Authorization: Bearer <token>` header.

### Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in, returns JWT |
| GET / POST | `/api/trips` | List / create trips |
| GET / PUT / DELETE | `/api/trips/{tripId}` | Read / update / delete a trip |
| GET / POST | `/api/trips/{tripId}/items` | List / create budget items |
| GET / PUT / DELETE | `/api/trips/{tripId}/items/{itemId}` | Read / update / delete an item |
| GET | `/api/trips/{tripId}/dashboard` | Totals for one trip |

### Important URLs

| What | URL |
|---|---|
| Website | http://localhost:5173 |
| API base | http://localhost:3000/api |
| Swagger UI (rendered docs) | http://localhost:3000/api-docs |
| Swagger YAML file | http://localhost:3000/api-docs.yaml |

## File Structure

```
.
├── .github/
│   └── workflows/
│       ├── api-tests.yml          # CI: quality gates, API tests and known-bug guardrails
│       ├── performance-tests.yml  # CI: quality gates, plus the timing test on demand
│       └── ui-tests.yml           # CI: quality gates and UI tests (Chromium)
├── src/                    # Express API: routes, controllers, services, models, seed
├── resources/
│   └── swagger.yaml        # OpenAPI 3 spec, served at /api-docs
├── frontend/
│   └── src/                # React app: pages, components, services/apiService.js, styles
└── tests/
    ├── api/                # API test project (own package.json)
    │   ├── test/
    │   │   ├── register/   # US-01 Sign Up tests (register.test.js)
    │   │   ├── login/      # US-02 Log In tests (login.test.js)
    │   │   ├── trips/      # US-03 Manage Trip Budgets tests (trips.test.js)
    │   │   ├── items/      # US-04 Manage Budget Items tests (items.test.js)
    │   │   └── helpers/    # Test helpers (unique email per run, token builders, logged-in user)
    │   ├── fixtures/       # Test data for the data driven tests
    │   ├── eslint.config.mjs  # ESLint configuration
    │   └── .mocharc.js     # Mocha configuration
    ├── performance/        # Performance test project (own package.json)
    │   ├── scenarios/      # Artillery scenarios, one file per user story (register.yml, login.yml, trips.yml)
    │   └── helpers/        # JavaScript used by the scenarios (trips.js creates the 100 trips)
    └── e2e/                # UI test project (own package.json)
        ├── features/       # Gherkin scenarios (sign-up.feature, log-in.feature, manage-trip-budgets.feature, manage-budget-items.feature)
        ├── steps/          # Step definitions and fixtures (playwright-bdd)
        ├── pages/          # Page objects (locators and user actions, no assertions)
        ├── support/        # Test data helpers (unique email per run)
        └── playwright.config.ts  # Playwright and playwright-bdd configuration
```

## Author

Rafael Albuquerque

- GitHub: [github.com/rafaabc](https://github.com/rafaabc)
- LinkedIn: [linkedin.com/in/rafael-albuquerque-qa](https://www.linkedin.com/in/rafael-albuquerque-qa/)

## License

ISC
