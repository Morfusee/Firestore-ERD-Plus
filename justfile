default:
    @just --list

# Install frontend and .NET dependencies
install:
    pnpm install
    dotnet restore Firestore-ERD-Plus.sln

# Start the isolated local MongoDB service
mongo-up:
    docker compose -f docker/compose.local.yml up -d

# Stop local MongoDB while preserving its named volume
mongo-down:
    docker compose -f docker/compose.local.yml down

# Follow local MongoDB logs
mongo-logs:
    docker compose -f docker/compose.local.yml logs -f aspnet-mongo

# Run frontend and ASP.NET backend together on the host
dev:
    pnpm dev

# Run the ASP.NET backend only
backend:
    pnpm backend

# Run the frontend only
frontend:
    pnpm frontend

# Generate the frontend API client; backend must be running on port 5084
api-generate:
    pnpm --filter frontend generate:api

# Format ASP.NET source and tests with CSharpier
format:
    dotnet csharpier format backend backend.Test

# Check ASP.NET source and test formatting without modifying files
format-check:
    dotnet csharpier check backend backend.Test

# Run backend tests
test:
    dotnet test Firestore-ERD-Plus.sln

# Run frontend lint
lint:
    pnpm --filter frontend lint

# Build backend and frontend production artifacts
build:
    dotnet build Firestore-ERD-Plus.sln
    pnpm --filter frontend build

# Run legacy Express backend for migration comparison only
old-backend:
    pnpm old_backend
