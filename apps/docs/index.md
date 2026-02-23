# Introduction

License Plate Checker is a system for supporting with the process of reserving personalized German license plates. It monitors plate availability on city reservation websites and informs you when your desired combination becomes available.

## How It Works

1. **Create a check** — enter your desired city, letters, and number combination
2. **Build a workflow** — use the visual drag-and-drop editor to define the automation steps for your city's reservation website
3. **Let it run** — the system executes your workflow daily using a headless browser, checking availability automatically

Under the hood, workflows are compiled into an intermediate representation and executed by [Playwright](https://playwright.dev/) workers on [Trigger.dev](https://trigger.dev/), with progress and results reported back in real time.

## Tech Stack

The project is a [Turborepo](https://turbo.build/repo) monorepo with three apps:

- **Backend** — [Hono](https://hono.dev/) + [Bun](https://bun.sh/) REST API with [Prisma](https://www.prisma.io/) ORM, deployed on [Fly.io](https://fly.io/)
- **Frontend** — [Next.js](https://nextjs.org/) with [shadcn/ui](https://ui.shadcn.com/) and [ReactFlow](https://reactflow.dev/) for the workflow builder
- **Docs** — this [VitePress](https://vitepress.dev/) site

## Useful Pages

- [Getting Started](/guide/getting-started) – Set up the project locally
- [Architecture](/devsecops/architecture) – system overview, data flow, and tech stack details
- [Creating a Workflow](/guide/creating-a-workflow) – build your first automation workflow
- [API Reference](https://api.lp-checker.com/docs) – interactive REST API documentation
