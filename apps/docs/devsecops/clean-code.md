# Clean Code

Practices and tools applied throughout the project.

## Principles

**Clear Project Structure** — Related files are grouped into folders by functionality (`/controllers`, `/validators`, `/services`, `/routes`). Files have matching suffixes (e.g., `auth.routes.ts`, `Authorization.controller.ts`) for easy navigation and project-wide search.

**Single Responsibility** — Functions and classes serve only the purpose they are named after. Each module handles one concern, following the Single Responsibility Principle (SRP).

**Reusable Components** — Common logic (validators, types, workflow DSL, template variables, node registry) lives in `packages/shared` and is imported by both frontend and backend, eliminating code duplication and inconsistency.

**Descriptive Error Handling** — Error messages provide clear information and appropriate HTTP status codes. A centralized `AppError` class and error handler in the API catches all errors and formats consistent responses. Unhandled exceptions are forwarded to Sentry.

**Avoiding Nested Code** — Nested if-else chains are replaced with guard clauses and early return patterns, keeping code linear and readable.

**Pure Functions** — Functions work only with their arguments wherever possible. Environment variables are parsed into typed values via Zod (`env.ts`), allowing dependent functions to be fully pure.

**Dependency Injection** — Controllers and services accept their dependencies as constructor parameters, enabling isolated unit testing with mocked dependencies.

## Code Analysis Tools

**Biome** — All-in-one linter and formatter replacing ESLint + Prettier. Runs on every commit and PR. Configuration in `biome.json`:
- Single quotes, 2-space indentation, 80-char line width
- Trailing commas (ES5 style), semicolons as needed
- Custom rule set with strict correctness, complexity, and suspicious pattern checks
- Relaxed `noExplicitAny` rule for test files

**TypeScript** — Strict mode enabled project-wide via `tsconfig.base.json`. All code is fully typed, with shared types from the monorepo's shared package. Path aliases (`@licenseplate-checker/shared/*`, `@shared/*`) simplify cross-package imports.

**CodeQL** — GitHub's default CodeQL setup scans for security vulnerabilities on PRs and on a weekly schedule. Also runs a separate typescript typecheck.

## Testing

**Bun Test Runner** — All tests use Bun's native test framework with `.test.ts` suffix. Test files are co-located with the source they test (e.g., `auth.routes.test.ts` alongside `auth.routes.ts`).

**Mock Database** — Tests run against `PrismockClient`, an in-memory Prisma mock, when `NODE_ENV=test`. No external database required for CI.

**Dependency Injection** — Controllers accept dependencies as constructor parameters, making it straightforward to swap real implementations for mocks in tests.

## Monorepo Conventions

- **Naming:** Scoped packages `@licenseplate-checker/{name}`, route files suffixed `.routes.ts`, controllers `.controller.ts`
- **Validation:** Zod schemas shared between frontend and backend via `packages/shared/validators`
- **Scripts:** Every package includes `lint`, `format`, and `typecheck` scripts, orchestrated by Turborepo
- **Formatting:** Biome handles both linting and formatting in a single tool
