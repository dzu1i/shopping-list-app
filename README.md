# Shopping List App

Full-stack shopping list app with a React frontend and an Express + MongoDB backend.

## Structure

- `frontend/` React UI (Create React App)
- `backend/` Express API + MongoDB

## Quick Start (Local)

1. Start MongoDB locally (or set `MONGODB_URI` in `backend/.env`).
2. Backend:

```bash
cd backend
npm install
npm run dev
```

3. Frontend:

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000` and proxies API calls to `http://localhost:3001`.

## Docs

- Frontend details: `frontend/README.md`
- Backend details: `backend/README.md`
