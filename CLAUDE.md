# CLAUDE.md

All code and text in this project must be in English.

## Backend
- Express, layered: routes -> controllers -> services -> models. Business rules live in services.
- In-memory store (`src/models/store.js`), seeded by `src/seed.js` on start.
- API spec: `resources/swagger.yaml` (served at `/api-docs` and `/api-docs.yaml`). Update it with every endpoint change.
- Money is DKK. Category list lives in `src/constants.js` and must match the spec enum and `frontend/src/components/format.js`.
- Ownership: services always go through `getOwnedTrip` (returns 404 for other users' trips).
- No automated tests by request.

## Frontend
- React 18 + Vite + react-router-dom 6, plain CSS (`frontend/src/styles/global.css`).
- All HTTP goes through `frontend/src/services/apiService.js` (add new endpoints as helpers there). Components never call `fetch`.
- JWT is stored in `localStorage` key `token`. A 401 on a protected call clears it and redirects to `/login`.
- Pages: Login, Register, Dashboard, Trips, TripDetail (items CRUD + trip dashboard).
