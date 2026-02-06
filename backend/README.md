# Shopping List App (Backend)

Express + TypeScript backend using MongoDB.

## Requirements

- Node.js 18+ recommended (works with Node 16+)
- MongoDB running locally or a connection string
- npm

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in this folder (optional):

```bash
MONGODB_URI=mongodb://127.0.0.1:27017
DB_NAME=shopping-list-app
PORT=3001
```

## Run (Development)

```bash
npm run dev
```

Backend runs at `http://localhost:3001`.

## Build + Start

```bash
npm run build
npm start
```

## Test

```bash
npm test
```

## API Overview

Base path: `/api`

Authentication:
- Provide `x-user-id` header with a valid MongoDB ObjectId
- Optional `x-user-profile` header: `owner | member | viewer` (defaults to `member`)

### Shopping Lists

- `GET /api/shopping-lists`
- `GET /api/shopping-lists/:listId`
- `POST /api/shopping-lists` body: `{ "name": "..." }`
- `PATCH /api/shopping-lists/:listId` body: `{ "name": "..." }` (owner only)
- `PATCH /api/shopping-lists/:listId/archive` (owner only)
- `DELETE /api/shopping-lists/:listId` (owner only)
- `POST /api/shopping-lists/:listId/members/:memberId` (owner only)
- `DELETE /api/shopping-lists/:listId/members/:memberId` (owner only)
- `POST /api/shopping-lists/:listId/leave` (member only)

### Shopping Items

- `GET /api/shopping-lists/:listId/items`
- `POST /api/shopping-lists/:listId/items` body: `{ "name": "...", "quantity": "..." }`
- `PATCH /api/shopping-lists/:listId/items/:itemId` body: `{ "name"?, "quantity"?, "isDone"? }`
- `DELETE /api/shopping-lists/:listId/items/:itemId`
- `POST /api/shopping-lists/:listId/items/:itemId/resolve`
- `POST /api/shopping-lists/:listId/items/:itemId/unresolve`

### Users

- `POST /api/users` body: `{ "name": "..." }`
- `GET /api/users`
- `DELETE /api/users/:userId`

## Notes

- Mongo collections used: `shoppingLists`, `shoppingItems`, `users`.
