# CLAUDE.md

All code and text in this project must be in English.

## Backend
- Express, layered: routes -> controllers -> services -> models. Business rules live in services.
- In-memory store (`src/models/store.js`), seeded by `src/seed.js` on start.
- API spec: `resources/swagger.yaml` (served at `/api-docs` and `/api-docs.yaml`). Update it with every endpoint change.
- Money is DKK. Category list lives in `src/constants.js` and must match the spec enum and `frontend/src/components/format.js`.
- Ownership: services always go through `getOwnedTrip` (returns 404 for other users' trips).
- No tests inside `src/`. Automated tests live in a separate project (see Tests). Do not change application source code to make tests pass.

## Frontend
- React 19 + Vite + react-router-dom 7, plain CSS (`frontend/src/styles/global.css`).
- All HTTP goes through `frontend/src/services/apiService.js` (add new endpoints as helpers there). Components never call `fetch`.
- JWT is stored in `localStorage` key `token`. A 401 on a protected call clears it and redirects to `/login`.
- Pages: Login, Register, Dashboard, Trips, TripDetail (items CRUD + trip dashboard).

## Tests
- API tests: `tests/api/` (own `package.json`; Mocha 12, Chai 4, Supertest, Mochawesome). They call the running API through `BASE_URL`, so start the backend first.
- Data driven: cases live in `tests/api/fixtures/*.json`; helpers in `tests/api/test/helpers/`. Use a unique email per run (the store is in memory).
- API tests that need a signed token (expired token) read `JWT_SECRET` from the environment, the same value the API runs with; they skip when it is not set. Tokens are built by hand in `tests/api/test/helpers/token.js` (no extra dependency).
- Quality gates, run from `tests/api`: `npm run lint`, `npm run format:check`, `npm run audit`.
- UI tests: `tests/e2e/` (own `package.json`; Playwright, playwright-bdd, TypeScript, Allure; Chromium only). Gherkin scenarios in `features/` (declarative, English), step definitions in `steps/`, page objects in `pages/`. Playwright starts the backend and the built frontend itself (`webServer`), so no manual start.
- UI test rules: role-based locators first (`getByRole`, `getByLabel`), no fixed waits (`waitForTimeout` is a lint error), no assertions in page objects, one unique email per run. A scenario counts as done after two green runs (`npm run test:stability`). Tag scenarios with the story (`@US-01`) and the test case key (`@TC-01-06`). Do not change the frontend to make a UI test pass.
- Quality gates, run from `tests/e2e`: `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm run audit`.
- Performance tests: `tests/performance/` (own `package.json`; Artillery 2, needs Node 22.18+). One YAML scenario per user story in `scenarios/`. They call the running API (start the backend first). Limits are defined with the `ensure` plugin and come from the test plan (response under 500 ms, checked as p95); other statistics (min, mean, median, p99, max) are reported without a limit. Do not invent thresholds, and keep telemetry off (`ARTILLERY_DISABLE_TELEMETRY` is set in the `npm test` script). Use a random email per request (the store is in memory). Setup that must not be measured (for example the 100 trips of `trips.yml`) goes in `helpers/` and runs in the `before` section with `fetch`; a function there must be `async` (no callback).
- Quality gates, run from `tests/performance`: `npm run format:check`, `npm run audit`.
- Tests tagged `@local-only` cannot be verified on the deployed environment (the Vercel firewall answers before the app). They run locally and in the normal API CI, and `deployed-tests.yml` excludes them (`--grep "@bug|@local-only" --invert`).
- Tests tagged `@bug #<issue>` are guardrails for open bugs and fail on purpose until the bug is fixed.
- CI: `.github/workflows/performance-tests.yml` runs the quality gates on a PR that touches `tests/performance/**`, and the timing test only on demand (`workflow_dispatch`), because response times on shared runners vary; never add it to the PR checks or make it required.
- CI: `.github/workflows/api-tests.yml` and `.github/workflows/ui-tests.yml` (GitHub Actions) run quality gates and the API / UI tests on every PR to `main`. Both skip changes that touch only `**/*.md` (`paths-ignore`); never make these jobs required checks in branch protection, because a skipped workflow would leave them pending and block the merge. The `@bug` guardrails run in a separate non-blocking job; the other jobs must stay green. When a bug is fixed, its guardrail test turns green and can lose the `@bug` tag.
- Deployed test environment: Vercel projects `trip-planner-backend` (root `/`, entrypoint `api/index.js`, which seeds and exports `src/app.js`) and `trip-planner-frontend` (root `frontend/`, built with `VITE_API_URL`). It is a test environment, never real production. The in-memory store resets on cold starts; treat failures from that as findings, do not change application code or limits to hide them. Run the suites against it by setting `BASE_URL` (API and UI) or `--target` (performance). `tests/e2e` starts no local server when `BASE_URL` is not localhost.
- CI: `.github/workflows/deployed-tests.yml` runs the three suites against the deployed environment, `workflow_dispatch` only, with the secret `TEST_ENV_JWT_SECRET`. Never add it to the PR checks or make it required.
- Test plan: GitHub Wiki (Test Plan). Work is tracked in the GitHub Project board and issues; bugs use the `bug` label and are linked as sub-issues of the session issue.

## Documentation workflow
- Before opening a PR, check whether `README.md` and this file need an update (new folders, scripts, versions, decisions), and update them in the same branch.
