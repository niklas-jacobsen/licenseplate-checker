# licenseplate-checker - Automatic personal license plate reservation

This project aims to simplify the process of making reservations for personally chosen license plates by
frequently performing a users requested license plate patterns on the corresponding website.

## Table of Contents

- [Dictionary](#dictionary)
- [Techstack](#techstack)
- [Running this project locally](#running-this-project-locally)
- [Routes](#routes)
- [Security](#security)
- [Code analysis tools](#code-analysis-tools)

## Dictionary

A detailed list of definitions for terms used in this project can be found in [Dictionary](./docs/Dictionary.md)

## Techstack

- [TypeScript](https://www.typescriptlang.org/): Type-safe superset of JavaScript
- [Hono](https://hono.dev/): Web Development Framework
- [Bun](https://bun.sh/): JavaScript Runtime, Package Manager, Test Runner
- [Prisma](https://www.prisma.io/): Object-Relations Mapper for Postgres Database
- [PostgreSQL](https://www.postgresql.org/): Relational Database
- [Playwright](https://playwright.dev/): Web automation and scraping

## Running this project locally

To run this project locally follow these steps:

1. Clone this repository
2. Use the `docker-compose.yaml` to start the local docker containers for the app and postgres database
3. Create an .env file following the scheme of the .env.example

```sh
# Backend port
PORT=ADD_BACKEND_PORT_HERE # Default: 8080

# Node environment
NODE_ENV=DEVELOPMENT

# URLs allowed for cross origin resource sharing (CORS) seperated by commas ','
ALLOWED_ORIGINS=ALLOWED_URLS

# Postgres database URL
DATABASE_URL=ADD_DATABASE_URL_HERE # Default can be copied from docker-compose.yml

# Force database seeding
FORCE_SEED="false"

# JWT secret
JWT_SECRET=ADD_JWT_SECRET_HERE

# Time window in which the rate limit resets
RATE_LIMIT_WINDOW=900000 # 900000ms equals 15 minutes

# Maximum allowed requests per IP in the above time window
RATE_LIMIT_MAX_REQUESTS=100

```

4. run `bun install` to install dependencies
5. run `bun run dev` to start the service

## Routes

The following routes are currently available

- `GET /` - Index Route
- `POST /auth/register` - Register a user account with `email` and `password`
- `POST /auth/login` - Login with `email` and `password`
- `POST /request/new` - Create a new licenseplate request with `city`, `letters` and `numbers`

## Security

Information on this topic can be found in the [Security.md](./docs/Security.md)

## Code analysis tools

- prettier
- eslint
- GitHub CodeQL
