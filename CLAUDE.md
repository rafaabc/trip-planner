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
- Tests tagged `@bug #<issue>` are guardrails for open bugs and fail on purpose until the bug is fixed.
- Test plan: GitHub Wiki (Test Plan). Work is tracked in the GitHub Project board and issues; bugs use the `bug` label and are linked as sub-issues of the session issue.

## Documentation workflow
- Before opening a PR, check whether `README.md` and this file need an update (new folders, scripts, versions, decisions), and update them in the same branch.
