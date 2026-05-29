# Firestore ERD Plus

Entity relationship diagram tool built with React, Vite, and ASP.NET.

## Prerequisites

- [.NET SDK 10.0](https://dotnet.microsoft.com/en-us/download/dotnet/10.0)
- [Node.js](https://nodejs.org/) (LTS recommended)
- [pnpm](https://pnpm.io/installation) 10.23+
- [MongoDB](https://www.mongodb.com/) (Atlas connection string in `backend/.env`)
- [Firebase](https://firebase.google.com/) project (keys in `backend/.env`)

## Project Structure

```
├── backend/          # ASP.NET 10.0 Web API
├── backend.Test/     # Backend tests
├── frontend/         # React SPA (Vite + TypeScript)
├── documentation/    # Project documentation
└── pnpm-workspace.yaml
```

## Quick Start

```bash
# Install frontend dependencies
pnpm install

# Start both frontend and backend
pnpm dev
```

## Running Separately

### Backend

```bash
# From workspace root
pnpm backend

# Or directly
dotnet watch run --project backend
```

The backend starts at `http://localhost:5084`. Swagger UI is available at `http://localhost:5084/swagger`.

### Frontend

```bash
# From workspace root
pnpm frontend

# Or directly
cd frontend && pnpm dev
```

The frontend starts at `http://localhost:5173` and proxies API calls to the backend.

## API Generator (hey-api)

The frontend uses [hey-api](https://heyapi.dev/) to generate a typed API client from the backend's Swagger spec.

**Prerequisite:** The backend must be running on port 5084.

```bash
# From workspace root
pnpm --filter frontend generate:api

# Or directly
cd frontend && pnpm generate:api
```

This fetches `http://localhost:5084/swagger/v1/swagger.json` and generates:
- TypeScript types (`types.gen.ts`)
- Fetch client (`sdk.gen.ts`)
- Zod validation schemas (`zod.gen.ts`)
- TanStack React Query hooks (`@tanstack/`)

Output directory: `frontend/src/integrations/api/generated/`

## Workspace Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Run frontend and backend together |
| `pnpm frontend` | Run frontend only |
| `pnpm backend` | Run backend only |
| `pnpm --filter frontend generate:api` | Generate API client from Swagger spec |
| `pnpm old_backend` | Run legacy Express backend |
