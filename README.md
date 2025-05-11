# licenseplate-checker - Automatic personal license plate reservation

![Production](https://img.shields.io/website?url=https%3A%2F%2Flicenseplate-checker-production-service-683398294242.europe-west10.run.app&up_message=running&down_message=offline&label=production)
![Staging](https://img.shields.io/website?url=https%3A%2F%2Flicenseplate-checker-staging-service-683398294242.europe-west10.run.app&up_message=running&down_message=asleep&down_color=yellow&label=staging)
[![CodeQL](https://github.com/niklas-jacobsen/licenseplate-checker/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/niklas-jacobsen/licenseplate-checker/actions/workflows/github-code-scanning/codeql)
[![Tests](https://github.com/niklas-jacobsen/licenseplate-checker/actions/workflows/pr-staging.yml/badge.svg)](https://github.com/niklas-jacobsen/licenseplate-checker/actions/workflows/pr-staging.yml)

This project aims to simplify the process of making reservations for individualized license plates by
frequently performing requests on a target reservation website using user-provided license plate patterns.

## Table of Contents

- [Documentation](#documentation)
- [Techstack](#techstack)
- [Running this project locally](#running-this-project-locally)

## Documentation

More information on the topics listed below can be found on their respective pages inside the `/docs`-folder

1. [Dictionary](./docs/01-Dictionary.md)
2. [Routes](./docs/02-Routes.md)
3. [Clean Code](./docs/03-CleanCode.md)
4. [Security](./docs/04-Security.md)

## Techstack

- [TypeScript](https://www.typescriptlang.org/): Type-safe superset of JavaScript
- [Bun](https://bun.sh/): JavaScript Runtime, Package Manager, Test Runner
- [Turborepo](https://turbo.build/repo): Monorepo tool for managing multiple packages  
- [Zod](https://zod.dev/): Type-safe schema validation shared between front- and backend

### Backend-specific
- [Docker](https://www.docker.com/): Provides containerization to run the backend in an isolated environment
- [Hono](https://hono.dev/): Web Development Framework
- [Prisma](https://www.prisma.io/): Object-Relations Mapper for Postgres Database
- [PostgreSQL](https://www.postgresql.org/): Relational Database
- [Playwright](https://playwright.dev/): Web automation and scraping

### Frontend-specific
- [Next.js](https://nextjs.org/): React framework with built-in routing and server features  
- [React](https://react.dev/): Library for building UI components  
- [React Hook Form](https://react-hook-form.com/): Simplifies form state and validation   
- [Tailwind CSS](https://tailwindcss.com/): Utility-based CSS framework  
- [shadcn/ui](https://ui.shadcn.com/): Prebuilt components using Tailwind  
- [Lucide React](https://lucide.dev/): Icon library for React apps  
- [happy-dom](https://github.com/capricorn86/happy-dom): Lightweight DOM implementation for frontend testting with Bun
- [Axios](https://axios-http.com/): Library for making HTTP requests to backend

## Running this project locally

To run this project locally follow these steps:

1. Clone this repository
2. Use the `docker-compose.yaml` to start the local docker containers for the app and postgres database
3. Create an .env file following the structure of the .env.example
4. run `bun install` to install dependencies
5. run `bun db:migrate`
6. run `bun turbo run dev` to start the service
