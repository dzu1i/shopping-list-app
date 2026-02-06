# Shopping List App (Frontend)

React frontend for the Shopping List app. It supports a mock API mode for local UI work and a real API mode for the backend.

## Requirements

- Node.js 16+ (works with CRA 5)
- npm

## Setup

Install dependencies:

```bash
npm install
```

Create or update `.env`:

```bash
REACT_APP_USE_MOCKS=false
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_USER_ID=507f1f77bcf86cd799439011
```

## Run (Development)

```bash
npm start
```

The app runs at `http://localhost:3000`.

## Build

```bash
npm run build
```

## Test

```bash
npm test
```

## Environment Variables

- `REACT_APP_USE_MOCKS`
  - `true` uses `frontend/src/api/mockApi.ts`
  - `false` uses `frontend/src/api/realApi.ts`
- `REACT_APP_API_BASE_URL`
  - Base URL for the backend (e.g. `http://localhost:3001`)
- `REACT_APP_USER_ID`
  - Used for auth headers when calling the backend

## Notes

- When using the real API, the frontend sends `x-user-id` in every request.
- The backend expects valid MongoDB ObjectId strings as user IDs.
