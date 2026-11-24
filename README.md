# My Trip Planner

[![API Tests](https://github.com/rafaabc/trip-planner/actions/workflows/api-tests.yml/badge.svg?branch=main)](https://github.com/rafaabc/trip-planner/actions/workflows/api-tests.yml)
[![UI Tests](https://github.com/rafaabc/trip-planner/actions/workflows/ui-tests.yml/badge.svg?branch=main)](https://github.com/rafaabc/trip-planner/actions/workflows/ui-tests.yml)
[![Performance Tests](https://github.com/rafaabc/trip-planner/actions/workflows/performance-tests.yml/badge.svg?branch=main)](https://github.com/rafaabc/trip-planner/actions/workflows/performance-tests.yml)

> A simple web app and REST API to plan the budget of a trip, used as a testing-focused portfolio project.

## Description

My Trip Planner lets you create a trip ("Trip budget - City 1 - City 2") and type in the amounts you expect to spend in each category. A dashboard shows the totals and the daily budget, all in **DKK**.

The backend is a Node.js + Express REST API with JWT authentication and an in-memory database (data resets on every restart). The frontend is a React website. The test work built around the app (API, UI and performance tests, CI, exploratory sessions) is described in [tests/README.md](tests/README.md).

A deployed test environment is online: [website](https://trip-planner-frontend-flax.vercel.app) and [API docs](https://trip-planner-backend-iota.vercel.app/api-docs). It is for testing only, and its data can disappear between requests.

## Dependencies

- Node.js 20 or newer, with npm
- Free ports `3000` (API) and `5173` (website)

## Technologies Used

| Area | Tools |
|---|---|
| Backend (project root) | Express 5, jsonwebtoken, bcryptjs, Swagger UI (OpenAPI 3) |
| Frontend (`frontend/`) | React 19, react-router-dom 7, Vite |
| API tests (`tests/api/`) | Mocha 12, Chai, Supertest, Mochawesome |
| UI tests (`tests/e2e/`) | Playwright, playwright-bdd (Gherkin), TypeScript, Allure |
| Performance tests (`tests/performance/`) | Artillery 2 |
| CI | GitHub Actions |

Exact versions are in each `package.json`.

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
   npm start

   # Terminal 2 - website on http://localhost:5173
   cd frontend
   npm run dev
   ```

The database is seeded on every start. You can log in with `alice@example.com` / `alice123` (also `bob@example.com` / `bob12345` and `carla@example.com` / `carla123`), or sign up.

| File | Variable | Description |
|---|---|---|
| `.env` | `JWT_SECRET` | Secret used to sign tokens. **Required.** |
| `.env` | `PORT`, `JWT_EXPIRES_IN` | API port (default `3000`) and token lifetime (for example `2h`) |
| `frontend/.env` | `VITE_API_URL` | API base URL (default `http://localhost:3000`) |

To run the tests, see [tests/README.md](tests/README.md).

## Features

**The application**

- Sign up and log in (JWT)
- Create, list, update and delete trip budgets and, inside a trip, budget items
- Dashboard with the total per category, the grand total and the daily budget

**Business rules**

- Categories: `Flights`, `Accommodation`, `Activities`, `Food`, `Transport`, `Travel insurance`, `Extras`. An amount is in DKK (0 or more).
- The daily budget is (Activities + Food + Transport + Extras) divided by the number of trip days, with the start and end date both counted. Flights, Accommodation and Travel insurance are not included. They still count in the category totals and the grand total.
- Users only see and change their own trips. Another user's trip returns `404`. Deleting a trip deletes its items.
- All endpoints except register and login need an `Authorization: Bearer <token>` header.

**Endpoints** (full spec in Swagger UI at [http://localhost:3000/api-docs](http://localhost:3000/api-docs))

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | Create account, log in (returns a JWT) |
| GET / POST | `/api/trips` | List / create trips |
| GET / PUT / DELETE | `/api/trips/{tripId}` | Read / update / delete a trip |
| GET / POST | `/api/trips/{tripId}/items` | List / create budget items |
| GET / PUT / DELETE | `/api/trips/{tripId}/items/{itemId}` | Read / update / delete an item |
| GET | `/api/trips/{tripId}/dashboard` | Totals for one trip |

**Test automation** (details in [tests/README.md](tests/README.md))

| Layer | Folder | What it covers |
|---|---|---|
| API | `tests/api/` | Data driven tests for the five user stories (sign up, log in, trips, items, dashboard) |
| UI | `tests/e2e/` | One Gherkin scenario per user story, with page objects |
| Performance | `tests/performance/` | Response time (p95 under 500 ms) for one request per story |
| CI | `.github/workflows/` | Lint, format check, audit and the tests on every pull request to `main` |

Tests tagged `@bug #<issue>` describe the expected behavior of an open bug and **fail on purpose** until it is fixed. They run in a separate, non-blocking CI job.

## File Structure

```
.
├── src/                 # Express API: routes, controllers, services, models, seed
├── resources/           # OpenAPI 3 spec (swagger.yaml), served at /api-docs
├── frontend/            # React app (src/: pages, components, services/apiService.js)
├── tests/
│   ├── api/             # API tests (Mocha) and their fixtures
│   ├── e2e/             # UI tests: features (Gherkin), steps, pages (Playwright)
│   ├── performance/     # Artillery scenarios and helpers
│   └── README.md        # How to run each suite, CI and the deployed test environment
└── .github/workflows/   # CI: api-tests, ui-tests, performance-tests, deployed-tests
```

## Author

Rafael Albuquerque

- GitHub: [github.com/rafaabc](https://github.com/rafaabc)
- LinkedIn: [linkedin.com/in/rafael-albuquerque-qa](https://www.linkedin.com/in/rafael-albuquerque-qa/)

## License

ISC
