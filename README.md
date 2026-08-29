# Firestore ERD Plus

Entity relationship diagram tooling built with React, Vite, ASP.NET Core, and MongoDB.

## Development baseline

Development is based on the `migration/asp.net` branch. Active backend work belongs in `backend/`; backend tests belong in `backend.Test/`. The `server/` and `old_backend/` directories remain migration references only: do not add new product behavior there or remove them during ASP.NET work.

Active Docker infrastructure and Docker-specific instructions live in `docker/`. Legacy Compose files under `old_backend/` are reference-only.

## Prerequisites

- .NET SDK 10.0
- Node.js LTS
- pnpm 10.23+
- Just
- Docker with Compose v2
- CSharpier (`dotnet tool install -g csharpier` when unavailable)
- Firebase project credentials for authentication flows

## First-time setup

```bash
just install
just mongo-up
```

Create `backend/.env` without committing it:

```dotenv
MongoDbSettings__ConnectionString=mongodb://127.0.0.1:27018
MongoDbSettings__DatabaseName=firestore_erd_plus_aspnet_local
FirebaseSettings__ApiKey=
FirebaseSettings__ProjectId=
FirebaseSettings__ServiceAccountJson=
```

The local MongoDB service is isolated from Atlas and the legacy `FERD` database. See [`docker/README.md`](docker/README.md) for health, persistence, logs, shutdown, and explicit reset commands.

## Development

```bash
just dev       # frontend and ASP.NET backend on the host
just frontend  # Vite at http://localhost:5173
just backend   # ASP.NET API at http://localhost:5084
```

Swagger UI is available at `http://localhost:5084/swagger` in development.

## API generation

With the backend running on port `5084`:

```bash
just api-generate
```

The generated client is written to `frontend/src/integrations/api/generated/`.

## Quality checks

```bash
just format
just format-check
just test
just lint
just build
```

`just build` verifies both the .NET solution and the frontend production build. `just old-backend` runs the legacy Express implementation for migration comparison only.

## Deployment

The ASP.NET API is published as `ghcr.io/morfusee/ferd-server` from `backend/Dockerfile`. Pushes to `main` publish both the short commit tag and `latest`, then call the configured Dokploy deployment webhook.

Dokploy uses [`docker/compose.dokploy.yml`](docker/compose.dokploy.yml) to run the API. Configure these variables in Dokploy:

- `FRONTEND_ORIGIN`
- `MONGODB_CONNECTION_STRING`
- `MONGODB_DATABASE_NAME`
- `FIREBASE_API_KEY`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT_JSON`

MongoDB and the frontend are deployed separately. See [`docker/README.md`](docker/README.md) for Compose validation and service details.

## Project structure

```text
backend/       Active ASP.NET Core API
backend.Test/  Active xUnit/Mongo2Go test suite
frontend/      React/Vite application
docker/        Local MongoDB and Dokploy Compose infrastructure
documentation/ Product documentation
old_backend/   Legacy Express and Docker migration reference
```

See [`code-style.md`](code-style.md) before changing ASP.NET code.
