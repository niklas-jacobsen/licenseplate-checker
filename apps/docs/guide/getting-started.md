# Getting Started

## Prerequisites

- [Bun](https://bun.sh/) v1.3+
- [Docker](https://www.docker.com/) (for local PostgreSQL)
- [Node.js](https://nodejs.org/) 18+ (for Next.js)

## Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/niklas-jacobsen/licenseplate-checker.git
   cd licenseplate-checker
   ```

2. **Start local services**

   ```bash
   docker compose up -d
   ```

   This starts a PostgreSQL 17 instance on port 5432 with default credentials (`postgres`/`admin`, database `mydb`).

3. **Configure environment**

   Create `.env` files based on the provided examples:

   ```bash
   cp apps/api/.env.example apps/api/.env
   ```

   Key variables:

   | Variable | Description |
   |---|---|
   | `PORT` | Default: 8080 |
   | `DATABASE_URL` | PostgreSQL connection string (pooled) |
   | `JWT_SECRET` | Secret for signing JWT tokens |
   | `ALLOWED_ORIGINS` | Comma-separated frontend URLs for CORS |
   | `NEXT_PUBLIC_BACKEND_URL` | Backend URL sent to trigger for webhook repsonse |

4. **Install dependencies**

   ```bash
   bun install
   ```

5. **Run database migrations**

   ```bash
   bun db:migrate
   ```

6. **Set up Trigger.dev** (required for workflow execution)

   Create a free account at [trigger.dev](https://trigger.dev/) and create a new project. Then add the following to your `apps/api/.env`:

   | Variable | Description |
   |---|---|
   | `TRIGGER_SECRET_KEY` | Dev API key from your Trigger.dev dashboard (`tr_dev_...`) |
   | `TRIGGER_WEBHOOK_SECRET` | A secret string used to authenticate webhook callbacks (defaults to `dev-webhook-secret`) |
   | `API_BASE_URL` | Base URL of your local API for Trigger.dev callbacks (default: `http://localhost:8080`) |

   Start the Trigger.dev dev CLI in a separate terminal:

   ```bash
   cd apps/api
   bunx trigger dev
   ```

   This connects your local machine to Trigger.dev's cloud, allowing it to discover tasks and send webhook callbacks to your local API.

7. **Start development servers**

   ```bash
   bun turbo run dev
   ```

   This starts both the API (port 8080) and the frontend (port 3000) in parallel.

## Project Structure

```
licenseplate-checker/
├── apps/
│   ├── api/          # Hono + Bun backend
│   ├── web/          # Next.js frontend
│   └── docs/         # VitePress documentation
├── packages/
│   └── shared/       # Shared validators, types, utilities
├── turbo.json        # Turborepo task config
└── package.json      # Workspace root
```

## Available Scripts

| Command | Description |
|---|---|
| `bun dev` | Start all apps in development mode |
| `bun build` | Build all apps |
| `bun lint` | Lint all packages with Biome |
| `bun format` | Format all packages with Biome |
| `bun test` | Run unit and integration tests |
| `bun typecheck` | TypeScript type checking |
