# Deployment

## Infrastructure

| Component | Service | Region |
|---|---|---|
| Backend API | [Fly.io](https://fly.io/) | Frankfurt (fra) |
| Database | [Supabase](https://supabase.com/) PostgreSQL | Frankfurt |
| Frontend | [Vercel](https://vercel.com/) | Global |

## Fly.io Configuration

### Production (`fly.toml`)

- **App:** `licenseplate-checker`
- **Machine:** shared-cpu-2x, 512MB RAM
- **Min machines:** 1 (always running)
- **Release command:** `release.sh` (runs migrations + seed)

### Staging (`fly.staging.toml`)

- **App:** `licenseplate-checker-staging`
- **Machine:** shared-cpu-1x, 512MB RAM
- **Min machines:** 0 (scales to zero when inactive)

## Docker

The API uses a multi-stage Dockerfile based on `oven/bun:1.3`:

1. **Base stage:** Installs dependencies and generates Prisma client
2. **Release stage:** Copies build artifacts, runs as non-root `bun` user

## Git Workflow

![Git Workflow](/git_workflow.png)

The project uses a three-branch strategy: `dev` → `staging` → `main`. PRs to `staging` and `main` trigger automated checks (lint, tests). Merges into `staging` and `main` trigger deployments.

## CI/CD Pipeline

![Deployment Pipeline](/deployment_pipeline.png)

All CI/CD is handled by GitHub Actions.

### Pull Request Checks

**PR → Staging** (`pr-staging.yml`):
- Lint with Biome
- Run unit and integration tests
- Type checking
- Check if trigger execution deployment is successful

**PR → Main** (`pr-main.yml`):
- Same checks as staging PR
- Check if frontend, backend and trigger execution deploys are successful

### Deployment

**Push to `staging`** (`deploy-staging.yml`):
- Deploys to `licenseplate-checker-staging` on Fly.io
- Uses `FLY_API_TOKEN_STAGING` secret

**Push to `main`** (`deploy-prod.yml`):
- Deploys to `licenseplate-checker` (production) on Fly.io
- Uses `FLY_API_TOKEN_PROD` secret

### Release Process

On each deployment, the release command runs before the app starts:

```bash
#!/bin/bash
set -euo pipefail
bunx prisma migrate deploy --schema prisma/schema.prisma
bun run db:seed
```

This ensures database migrations are applied and seed data is up to date.

## Environment Variables

### Backend (`apps/api`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `8080` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `DATABASE_URL` | Yes | — | PostgreSQL connection (pooled) |
| `JWT_SECRET` | Yes | — | JWT signing secret |
| `ALLOWED_ORIGINS` | Yes | — | CORS allowed origins (comma-separated) |
| `RATE_LIMIT_WINDOW` | No | `900000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | No | `1000` | Max requests per window |
| `TRIGGER_SECRET_KEY` | No | — | Trigger.dev API key |
| `TRIGGER_WEBHOOK_SECRET` | No | `dev-webhook-secret` | Webhook verification secret |
| `API_BASE_URL` | No | `http://localhost:8080` | API URL for task scheduling |

### Frontend (`apps/web`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Yes | API backend URL |

## Database

PostgreSQL on Supabase with two connection modes:

- **Pooled** (`DATABASE_URL`): Used at runtime via pgBouncer for connection pooling
- **Direct** (`DIRECT_DATABASE_URL`): Used by Prisma CLI for migrations only

Migrations live in `apps/api/prisma/migrations/` and are applied automatically during deployment.

## Monitoring

- **Sentry** (`@sentry/bun`): Captures unhandled exceptions in production. Only enabled when `NODE_ENV=production`.
- **Fly.io Dashboard & Grafana**: Machine health, logs, and metrics.
