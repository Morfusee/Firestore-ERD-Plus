# Local Docker Infrastructure

`docker/compose.local.yml` owns the active ASP.NET development infrastructure. It starts MongoDB only; run the frontend and backend on the host.

## Start and verify

```bash
docker compose -f docker/compose.local.yml up -d
docker compose -f docker/compose.local.yml ps
```

MongoDB is available only on `mongodb://127.0.0.1:27018`. Configure the ASP.NET backend with:

```dotenv
MongoDbSettings__ConnectionString=mongodb://127.0.0.1:27018
MongoDbSettings__DatabaseName=firestore_erd_plus_aspnet_local
```

The `aspnet-mongo` service should report `healthy` before starting the backend.

## Stop and inspect

```bash
docker compose -f docker/compose.local.yml down
docker compose -f docker/compose.local.yml logs -f aspnet-mongo
```

Normal `down` preserves `firestore-erd-plus-aspnet-local-mongo-data`.

## Reset local data

Data removal is intentionally not a Just recipe. To permanently remove only this local ASP.NET MongoDB volume:

```bash
docker compose -f docker/compose.local.yml down --volumes
```

This stack is isolated from Atlas and from the reference Docker files under `old_backend/`. Do not point it at the legacy `FERD` database or reuse legacy ports, volumes, or networks.

## Dokploy API deployment

`docker/compose.dokploy.yml` runs only the production ASP.NET API. Dokploy pulls `ghcr.io/morfusee/ferd-server:latest`, routes traffic to container port `8080`, and provides TLS and the public hostname.

The stack requires the following Dokploy environment variables:

- `FRONTEND_ORIGIN`: exact public frontend origin allowed by CORS
- `MONGODB_CONNECTION_STRING`: external production MongoDB connection string
- `MONGODB_DATABASE_NAME`: production database name
- `FIREBASE_API_KEY`: Firebase web API key
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_SERVICE_ACCOUNT_JSON`: complete Firebase service-account JSON

The stack does not create MongoDB or deploy the frontend.

Validate the Compose model without deploying:

```bash
docker compose -f docker/compose.dokploy.yml config
```

All required variables must be present for validation to succeed.
