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

**Biome** — All-in-one linter and formatter that replaces the previous ESLint + Prettier setup. Runs on every commit and PR. Configuration in `biome.json`:
- Single quotes, 2-space indentation, 80-char line width
- Trailing commas (ES5 style), semicolons as needed
- Comprehensive lint rules for correctness, complexity, style, and suspicious patterns
- Relaxed `noExplicitAny` rule for test files

**TypeScript** — Strict mode enabled project-wide via `tsconfig.base.json`. All code is fully typed, with shared types from the monorepo's shared package.

**GitHub CodeQL** — Scans code for security vulnerabilities on every push, PR, and weekly. Prevents commits containing secrets and detects common vulnerability patterns.

**Dependabot** — Continuously checks for outdated and vulnerable dependencies. Creates automated PRs for updates.

## Monorepo Conventions

- **Naming:** Scoped packages `@licenseplate-checker/{name}`, route files suffixed `.routes.ts`, controllers `.controller.ts`
- **Validation:** Zod schemas shared between frontend and backend via `packages/shared/validators`
- **Testing:** Bun test runner with `.unit.test.ts` and `.int.test.ts` conventions, dependency injection for mockable tests
- **Scripts:** Every package includes `lint`, `format`, and `typecheck` scripts
- **Formatting:** Biome handles both linting and formatting in a single tool
