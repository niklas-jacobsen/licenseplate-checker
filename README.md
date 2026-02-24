# License Plate Checker

![Production](https://img.shields.io/website?url=https%3A%2F%2Fapi.lp-checker.com&up_message=online&down_message=offline&label=production&style=for-the-badge)
![Staging](https://img.shields.io/website?url=https%3A%2F%2Fstaging.lp-checker.com&up_message=online&down_message=asleep&down_color=yellow&label=staging&style=for-the-badge)
[![Tests](https://img.shields.io/github/actions/workflow/status/niklas-jacobsen/licenseplate-checker/pr-staging.yml?label=tests&style=for-the-badge)](https://github.com/niklas-jacobsen/licenseplate-checker/actions/workflows/pr-staging.yml)

A system for automating the reservation of personalized German license plates. It monitors plate availability on city reservation websites using browser automation and informs you when your desired combination becomes available.

![Workflow Builder](./apps/docs/public/builder.jpeg)

## How It Works

1. **Create a check** — enter your desired city, letters, and number combination
2. **Build a workflow** — use the visual drag-and-drop editor to define the automation steps for your city's reservation website
3. **Let it run** — the system executes your workflow daily using a headless browser, checking availability automatically

## Tech Stack

[Turborepo](https://turbo.build/repo) monorepo with three apps:

| App | Stack |
|---|---|
| **Frontend** | [Next.js](https://nextjs.org/), [shadcn/ui](https://ui.shadcn.com/), [ReactFlow](https://reactflow.dev/), deployed on [Vercel](https://vercel.com)|
| **Backend** | [Hono](https://hono.dev/) + [Bun](https://bun.sh/), [Prisma](https://www.prisma.io/), [Playwright](https://playwright.dev/), deployed on [Fly.io](https://fly.io/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/), hosted on [Supabase](https://supabase.com/) |
| **Docs + API Referece** | [VitePress](https://vitepress.dev/), [Scalar](https://scalar.com/) |

## Documentation

Full documentation lives in [`apps/docs`](./apps/docs/) and covers architecture, guides, API reference, security, and more. However I recommend viewing it [here](https://docs.lp-checker.com).

| Resource | Description |
|---|---|
| [Getting Started](./apps/docs/guide/getting-started.md) | Local setup and prerequisites |
| [Architecture](./apps/docs/devsecops/architecture.md) | System overview, data flow, and database models |
| [Creating a Workflow](./apps/docs/guide/creating-a-workflow.md) | Build your first automation workflow |
| [API Reference](https://api.lp-checker.com/docs) | Interactive REST API documentation |
