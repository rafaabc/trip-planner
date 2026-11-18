# My Trip Planner

## What is this application?

My Trip Planner is a simple web app and REST API to plan the budget of a trip. You create a trip ("Trip budget - City 1 - City 2"), then fill in the amounts you expect to spend in each category. A dashboard shows the totals.

There are no external integrations. You research prices yourself and type them in. All money values are in **DKK**.

Features: sign up, log in, trip budget CRUD, budget item CRUD, dashboard.

- **Backend:** Node.js + Express, JWT auth, in-memory database (data resets on every restart)
- **Frontend:** React + Vite
- **API docs:** OpenAPI 3 file at `resources/swagger.yaml`, rendered with Swagger UI

## How to install

Requirements: Node.js 20 or newer.

```bash
# Backend (project root)
npm install
cp .env.example .env   # then set JWT_SECRET to any long random string

# Frontend
cd frontend
npm install
cp .env.example .env
```

### Environment variables

| File | Variable | Description |
|------|----------|-------------|
| `.env` | `PORT` | API port (default `3000`) |
| `.env` | `JWT_SECRET` | Secret used to sign tokens. **Required.** |
| `.env` | `JWT_EXPIRES_IN` | Token lifetime, e.g. `2h` |
| `frontend/.env` | `VITE_API_URL` | API base URL (default `http://localhost:3000`) |

## How to run

Start the backend and the frontend in two terminals:

```bash
# Terminal 1 - API on http://localhost:3000
npm start            # or: npm run dev (auto-reload)

# Terminal 2 - website on http://localhost:5173
cd frontend
npm run dev
```

The database is seeded with test data on every start.

## Test data

All passwords are for local testing only.

| User | Email | Password | Trip |
|------|-------|----------|------|
| Alice Jensen | `alice@example.com` | `alice123` | Copenhagen - Lisbon (2026-03-10 to 2026-03-15) |
| Bob Nielsen | `bob@example.com` | `bob12345` | Copenhagen - Rome (2026-06-20 to 2026-06-27) |
| Carla Hansen | `carla@example.com` | `carla123` | Aarhus - Barcelona (2026-09-05 to 2026-09-10) |

Each trip has budget items in all seven categories.

## Business rules

1. A user can create, list, update and delete a trip budget, named `Trip budget - [City 1] - [City 2]`. A trip has a start and an end date (end must not be before start).
2. Inside a trip, the user can create, list, update and delete budget items. Each item has a **category**, an **amount** in DKK (0 or more), an optional **description** and a **date**.
3. Allowed categories: `Flights`, `Accommodation`, `Activities`, `Food`, `Transport`, `Travel insurance`, `Extras`.
4. An item's date must be inside the trip dates. If no date is sent, the trip start date is used. A trip's dates cannot be changed so that existing items fall outside them.
5. The dashboard shows the **total per category**, the **grand total** and the **total per day**, all in DKK. It is shown per trip; there is no sum across trips.
6. Users only see and change their own trips. Another user's trip returns `404`.
7. Deleting a trip deletes its budget items.
8. All endpoints except register and login need a `Authorization: Bearer <token>` header.

## Important URLs

| What | URL |
|------|-----|
| Website | http://localhost:5173 |
| API base | http://localhost:3000/api |
| Swagger UI (rendered docs) | http://localhost:3000/api-docs |
| Swagger YAML file | http://localhost:3000/api-docs.yaml |

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in, returns JWT |
| GET / POST | `/api/trips` | List / create trips |
| GET / PUT / DELETE | `/api/trips/{tripId}` | Read / update / delete a trip |
| GET / POST | `/api/trips/{tripId}/items` | List / create budget items |
| GET / PUT / DELETE | `/api/trips/{tripId}/items/{itemId}` | Read / update / delete an item |
| GET | `/api/trips/{tripId}/dashboard` | Totals for one trip |

## Project structure

```
src/            Express API (routes, controllers, services, models, seed)
resources/      swagger.yaml
frontend/src/   React app (pages, components, services/apiService.js)
```
