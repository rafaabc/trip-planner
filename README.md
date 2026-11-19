# My Trip Planner

> A simple web app and REST API to plan the budget of a trip, used as a testing-focused portfolio project.

## Description

My Trip Planner lets you create a trip ("Trip budget - City 1 - City 2") and fill in the amounts you expect to spend in each category. A dashboard shows the totals, the grand total and the daily budget. There are no external integrations: you research prices yourself and type them in. All money values are in **DKK**.

The backend is a Node.js + Express REST API with JWT authentication and an in-memory database (data resets on every restart). The frontend is a React + Vite website. The API is documented with an OpenAPI 3 file rendered by Swagger UI.

The project also contains the test work built around the application:

- Test plan: [Wiki - Test Plan](https://github.com/rafaabc/trip-planner/wiki/Test-Plan)
- Work tracking: [GitHub Project board](https://github.com/users/rafaabc/projects/2)
- Automated API tests: `tests/api/` (see [Installation and Setup](#installation-and-setup))

## Dependencies

Install these before running the project:

- Node.js 20 or newer, with npm
- A free port `3000` (API) and `5173` (website)
- For the automated API tests: the backend must be running (see below)

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

Four tests (tagged `@bug #19` and `@bug #20`) describe the expected behavior of open bugs and **fail on purpose** until the bugs are fixed.

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
├── src/                    # Express API: routes, controllers, services, models, seed
├── resources/
│   └── swagger.yaml        # OpenAPI 3 spec, served at /api-docs
├── frontend/
│   └── src/                # React app: pages, components, services/apiService.js, styles
└── tests/
    └── api/                # API test project (own package.json)
        ├── test/
        │   ├── register/   # US-01 Sign Up tests (register.test.js)
        │   └── helpers/    # Test helpers (unique email per run)
        ├── fixtures/       # Test data for the data driven tests
        ├── eslint.config.mjs  # ESLint configuration
        └── .mocharc.js     # Mocha configuration
```

## Author

Rafael Albuquerque

- GitHub: [github.com/rafaabc](https://github.com/rafaabc)
- LinkedIn: [linkedin.com/in/rafael-albuquerque-qa](https://www.linkedin.com/in/rafael-albuquerque-qa/)

## License

ISC
