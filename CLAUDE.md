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
- Quality gates, run from `tests/api`: `npm run lint`, `npm run format:check`, `npm run audit`.
- UI tests: `tests/e2e/` (own `package.json`; Playwright, playwright-bdd, TypeScript, Allure; Chromium only). Gherkin scenarios in `features/` (declarative, English), step definitions in `steps/`, page objects in `pages/`. Playwright starts the backend and the built frontend itself (`webServer`), so no manual start.
- UI test rules: role-based locators first (`getByRole`, `getByLabel`), no fixed waits (`waitForTimeout` is a lint error), no assertions in page objects, one unique email per run. A scenario counts as done after two green runs (`npm run test:stability`). Tag scenarios with the story (`@US-01`) and the test case key (`@TC-01-06`). Do not change the frontend to make a UI test pass.
- Quality gates, run from `tests/e2e`: `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm run audit`.
- Performance tests: `tests/performance/` (own `package.json`; Artillery 2, needs Node 22.18+). One YAML scenario per user story in `scenarios/`. They call the running API (start the backend first). Limits are defined with the `ensure` plugin and come from the test plan (response under 500 ms, checked as p95); other statistics (min, mean, median, p99, max) are reported without a limit. Do not invent thresholds, and keep telemetry off (`ARTILLERY_DISABLE_TELEMETRY` is set in the `npm test` script). Use a random email per request (the store is in memory).
- Quality gates, run from `tests/performance`: `npm run format:check`, `npm run audit`.
- Tests tagged `@bug #<issue>` are guardrails for open bugs and fail on purpose until the bug is fixed.
- CI: `.github/workflows/performance-tests.yml` runs the quality gates on a PR that touches `tests/performance/**`, and the timing test only on demand (`workflow_dispatch`), because response times on shared runners vary; never add it to the PR checks or make it required.
- CI: `.github/workflows/api-tests.yml` and `.github/workflows/ui-tests.yml` (GitHub Actions) run quality gates and the API / UI tests on every PR to `main`. Both skip changes that touch only `**/*.md` (`paths-ignore`); never make these jobs required checks in branch protection, because a skipped workflow would leave them pending and block the merge. The `@bug` guardrails run in a separate non-blocking job; the other jobs must stay green. When a bug is fixed, its guardrail test turns green and can lose the `@bug` tag.
- Test plan: GitHub Wiki (Test Plan). Work is tracked in the GitHub Project board and issues; bugs use the `bug` label and are linked as sub-issues of the session issue.

## Documentation workflow
- Before opening a PR, check whether `README.md` and this file need an update (new folders, scripts, versions, decisions), and update them in the same branch.
