# Install frontend dependencies
install:
    pnpm install

# Run frontend and backend together
dev:
    pnpm dev

# Run backend only
backend:
    pnpm backend

# Run frontend only
frontend:
    pnpm frontend

# Generate typed API client from backend Swagger spec
# Requires: backend running on port 5084
api-generate:
    pnpm --filter frontend generate:api

# Run legacy Express backend
old-backend:
    pnpm old_backend
