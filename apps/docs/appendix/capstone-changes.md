# Capstone Changes

This page documents all files that were added, modified, or deleted as part of the capstone project. Work began after this commit: [`a473895`](https://github.com/niklas-jacobsen/licenseplate-checker/commit/a473895871230ee21685ca667724f92ab760df97).

## Overview

### New

- **Workflow Builder:** The entire node-based editor on the frontend including the compiler, IR executor, and graph validation engine on the backend
- **Checks & Scheduling:** Replaced the old "request/query" system with a new check model. Added Trigger.dev integration for scheduled workflow execution and background jobs
- **Shared Packages:** Workflow DSL, node registry, builder IR, template variable system, and shared constants.
- **Testing:** ~3,600 lines of tests across 23 files covering routes, controllers, hooks, components, and the builder engine.

### Modified

- **Database:** Schema was significantly extended (new workflow, check, and schedule models). Old migrations were consolidated and replaced with new ones.
- **CI/CD & Deployment:** Migrated from Google Cloud Run to Fly.io, added a staging environment, and added a PR validation workflow.
- **Frontend UI:** New pages for checks, workflows, and the builder. Several shadcn/ui primitives were added. Existing components (nav bar, plate preview, profile) received incremental updates.

### Mostly Unchanged

- **Authentication:** Minor refactors to the auth middleware, routes, and controller (~22 insertions across 3 backend files). Frontend auth pages received only small layout tweaks.
- **Shared Validators & Types:** Pre-existing validators and types received minor updates.

## Full list of changes

`A` Added · `M` Modified · `D` Deleted · `R` Renamed

::: tip Full Diff
View the complete diff on GitHub: [Compare pre-capstone → dev](https://github.com/niklas-jacobsen/licenseplate-checker/compare/a473895~1...dev)
:::

### CI/CD

| Status | File |
|--------|------|
| M | `.github/workflows/deploy-prod.yml` |
| M | `.github/workflows/deploy-staging.yml` |
| A | `.github/workflows/pr-main.yml` |
| M | `.github/workflows/pr-staging.yml` |

### API - Infrastructure

| Status | File |
|--------|------|
| M | `apps/api/.gitignore` |
| M | `apps/api/Dockerfile` |
| A | `apps/api/openapi.json` |
| M | `apps/api/package.json` |
| M | `apps/api/tsconfig.json` |
| A | `apps/api/trigger.config.ts` |

### API - Database & Prisma

| Status | File |
|--------|------|
| M | `apps/api/prisma/data-source.ts` |
| M | `apps/api/prisma/schema.prisma` |
| M | `apps/api/prisma/seeding/cityData.ts` |
| M | `apps/api/prisma/seeding/seed.js` |
| M |  8 database migration files |

### API - Workflow Builder Engine

| Status | File |
|--------|------|
| A | `apps/api/src/builder/compiler/GraphToIrCompiler.ts` |
| A | `apps/api/src/builder/compiler/GraphToIrCompiler.test.ts` |
| A | `apps/api/src/builder/executor/IrExecutor.ts` |
| A | `apps/api/src/builder/executor/IrExecutor.test.ts` |
| A | `apps/api/src/builder/validate/validateGraph.ts` |
| A | `apps/api/src/builder/validate/validateGraph.test.ts` |

### API - Controllers

| Status | File |
|--------|------|
| M | `apps/api/src/controllers/Authorization.controller.ts` |
| M | `apps/api/src/controllers/City.controller.ts` |
| A | `apps/api/src/controllers/LicensePlateCheck.controller.ts` |
| A | `apps/api/src/controllers/Workflow.controller.ts` |
| M | `apps/api/src/controllers/User.controller.ts` |
| D | `apps/api/src/controllers/LicensePlateQuery.controller.ts` |
| D | `apps/api/src/controllers/LicensePlateRequest.controller.ts` |

### API - Routes

| Status | File |
|--------|------|
| M | `apps/api/src/routes.ts` |
| M | `apps/api/src/routes/auth.routes.ts` |
| M | `apps/api/src/routes/auth.routes.test.ts` |
| A | `apps/api/src/routes/builder.routes.ts` |
| A | `apps/api/src/routes/builder.routes.test.ts` |
| A | `apps/api/src/routes/builder.routes.execute.test.ts` |
| A | `apps/api/src/routes/city.routes.ts` |
| A | `apps/api/src/routes/city.routes.test.ts` |
| A | `apps/api/src/routes/docs.routes.ts` |
| M | `apps/api/src/routes/index.routes.test.ts` |
| A | `apps/api/src/routes/internal.routes.ts` |
| A | `apps/api/src/routes/internal.routes.test.ts` |
| A | `apps/api/src/routes/licensePlateCheck.routes.ts` |
| A | `apps/api/src/routes/licensePlateCheck.routes.test.ts` |
| D | `apps/api/src/routes/licensePlateRequest.routes.ts` |
| M | `apps/api/src/routes/user.routes.ts` |
| A | `apps/api/src/routes/user.routes.test.ts` |
| A | `apps/api/src/routes/webhook.routes.ts` |
| A | `apps/api/src/routes/webhook.routes.test.ts` |

### API - Services & Background Jobs

| Status | File |
|--------|------|
| A | `apps/api/src/services/executeWorkflowForCheck.ts` |
| A | `apps/api/src/services/executeWorkflowForCheck.test.ts` |
| A | `apps/api/src/trigger/executeWorkflow.ts` |
| A | `apps/api/src/trigger/scheduledCheckExecution.ts` |

### API - Other

| Status | File |
|--------|------|
| M | `apps/api/src/app.ts` |
| M | `apps/api/src/env.ts` |
| M | `apps/api/src/index.ts` |
| A | `apps/api/src/instrument.ts` |
| M | `apps/api/src/middleware/auth.ts` |
| M | `apps/api/src/middleware/rateLimiter.ts` |
| A | `apps/api/src/types/auth.types.ts` |
| A | `apps/api/src/types/compiler.types.ts` |
| A | `apps/api/src/types/validate.types.ts` |
| D | `apps/api/src/types/controller.types.ts` |
| D | `apps/api/src/playwright/cities/cityController.example.json` |
| D | `apps/api/src/playwright/cities/muenster.json` |
| D | `apps/api/src/scraper/muenster.ts` |
| D | `apps/api/src/utils/requestParser.ts` |

### Frontend - Workflow Builder

| Status | File |
|--------|------|
| A | `apps/web/app/builder/page.tsx` |
| A | `apps/web/app/builder/config.ts` |
| A | `apps/web/app/builder/store/builder-store.ts` |
| A | `apps/web/app/builder/store/index.tsx` |
| A | `apps/web/app/builder/hooks/useDragAndDrop.ts` |
| A | `apps/web/app/builder/components/bottom-palette.tsx` |
| A | `apps/web/app/builder/components/execution-error-banner.tsx` |
| A | `apps/web/app/builder/components/outcome-toast.tsx` |
| A | `apps/web/app/builder/components/test-dialog.tsx` |
| A | `apps/web/app/builder/components/variable-input.tsx` |
| A | `apps/web/app/builder/components/variable-picker.tsx` |
| A | `apps/web/app/builder/components/edges/workflow-edge.tsx` |
| A | `apps/web/app/builder/components/edges/index.ts` |
| A | `apps/web/app/builder/components/nodes/base-handle.tsx` |
| A | `apps/web/app/builder/components/nodes/base-node.tsx` |
| A | `apps/web/app/builder/components/nodes/click-node.tsx` |
| A | `apps/web/app/builder/components/nodes/conditional-node.tsx` |
| A | `apps/web/app/builder/components/nodes/end-node.tsx` |
| A | `apps/web/app/builder/components/nodes/node-status-indicator.tsx` |
| A | `apps/web/app/builder/components/nodes/open-page-node.tsx` |
| A | `apps/web/app/builder/components/nodes/select-option-node.tsx` |
| A | `apps/web/app/builder/components/nodes/start-node.tsx` |
| A | `apps/web/app/builder/components/nodes/type-text-node.tsx` |
| A | `apps/web/app/builder/components/nodes/wait-node.tsx` |
| A | `apps/web/app/builder/components/nodes/index.ts` |

### Frontend - Pages

| Status | File |
|--------|------|
| M | `apps/web/app/auth/login/page.tsx` |
| M | `apps/web/app/auth/register/page.tsx` |
| A | `apps/web/app/checks/page.tsx` |
| M | `apps/web/app/layout.tsx` |
| M | `apps/web/app/page.tsx` |
| M | `apps/web/app/profile/page.tsx` |
| A | `apps/web/app/workflows/page.tsx` |
| A | `apps/web/app/workflows/[id]/page.tsx` |
| D | `apps/web/app/requests/page.tsx` |

### Frontend - Components

| Status | File |
|--------|------|
| R | `apps/web/lib/auth-context.tsx` → `apps/web/components/auth-context.tsx` |
| M | `apps/web/components/auth-status.tsx` |
| A | `apps/web/components/check-dashboard.tsx` |
| A | `apps/web/components/check-form.tsx` |
| A | `apps/web/components/city-picker.tsx` |
| M | `apps/web/components/nav-bar-simple.tsx` |
| M | `apps/web/components/nav-bar.tsx` |
| M | `apps/web/components/plate-preview.tsx` |
| M | `apps/web/components/profile-form.tsx` |
| M | `apps/web/components/profile-update-modal.tsx` |
| A | `apps/web/components/workflow-list.tsx` |
| D | `apps/web/components/request-dashboard.tsx` |
| D | `apps/web/components/request-form.tsx` |
| A | `apps/web/components/ui/alert-dialog.tsx` |
| A | `apps/web/components/ui/badge.tsx` |
| M | `apps/web/components/ui/card.tsx` |
| M | `apps/web/components/ui/combobox.tsx` |
| M | `apps/web/components/ui/dialog.tsx` |
| A | `apps/web/components/ui/select.tsx` |
| A | `apps/web/components/ui/separator.tsx` |
| A | `apps/web/components/ui/textarea.tsx` |

### Frontend - Hooks, Lib & Services

| Status | File |
|--------|------|
| A | `apps/web/hooks/use-persisted-form.ts` |
| A | `apps/web/hooks/use-persisted-form.test.ts` |
| A | `apps/web/hooks/use-plate-input.ts` |
| A | `apps/web/hooks/use-plate-input.test.ts` |
| M | `apps/web/lib/api-client.ts` |
| A | `apps/web/lib/api-client.test.ts` |
| A | `apps/web/lib/utils.ts` |
| A | `apps/web/lib/utils.test.ts` |
| A | `apps/web/services/check.service.ts` |
| A | `apps/web/services/city.service.ts` |
| A | `apps/web/services/user.service.ts` |
| A | `apps/web/services/workflow.service.ts` |

### Frontend - Tests

| Status | File |
|--------|------|
| A | `apps/web/tests/components/auth-context.test.tsx` |
| A | `apps/web/tests/components/auth-status.test.tsx` |
| A | `apps/web/tests/components/check-dashboard.test.tsx` |
| A | `apps/web/tests/components/city-picker.test.tsx` |
| M | `apps/web/tests/components/nav-bar-simple.test.tsx` |

### Frontend - Other

| Status | File |
|--------|------|
| M | `apps/web/app/globals.css` |
| A | `apps/web/app/icon.png` |
| M | `apps/web/components.json` |
| M | `apps/web/next.config.ts` |
| M | `apps/web/package.json` |
| M | `apps/web/tsconfig.json` |
| R | `apps/web/fonts/EuroPlate-new.ttf` → `apps/web/public/fonts/EuroPlate-new.ttf` |
| R | `apps/web/fonts/EuroPlate.ttf` → `apps/web/public/fonts/EuroPlate.ttf` |
| A | `apps/web/public/logotype-full.svg` |
| A | `apps/web/public/logotype.svg` |

### Shared Packages

| Status | File |
|--------|------|
| M | `packages/shared/package.json` |
| M | `packages/shared/types/index.ts` |
| M | `packages/shared/types/types.ts` |
| A | `packages/shared/types/error.types.ts` |
| A | `packages/shared/types/executor.types.ts` |
| A | `packages/shared/builder-ir/index.ts` |
| A | `packages/shared/builder-ir/ir.schema.ts` |
| A | `packages/shared/builder-ir/types.ts` |
| A | `packages/shared/constants/limits.ts` |
| A | `packages/shared/constants/schemes.ts` |
| A | `packages/shared/node-registry/index.ts` |
| A | `packages/shared/node-registry/registry.ts` |
| A | `packages/shared/node-registry/nodes/index.ts` |
| A | `packages/shared/node-registry/nodes/core.click.ts` |
| A | `packages/shared/node-registry/nodes/core.conditional.ts` |
| A | `packages/shared/node-registry/nodes/core.end.ts` |
| A | `packages/shared/node-registry/nodes/core.openPage.ts` |
| A | `packages/shared/node-registry/nodes/core.selectOption.ts` |
| A | `packages/shared/node-registry/nodes/core.start.ts` |
| A | `packages/shared/node-registry/nodes/core.typeText.ts` |
| A | `packages/shared/node-registry/nodes/core.wait.ts` |
| A | `packages/shared/template-variables/index.ts` |
| A | `packages/shared/template-variables/index.test.ts` |
| M | `packages/shared/validators/licensePlateValidators/cityRequest.validator.ts` |
| M | `packages/shared/validators/licensePlateValidators/lettersRequest.validator.ts` |
| M | `packages/shared/validators/licensePlateValidators/numbersRequest.validator.ts` |
| A | `packages/shared/validators/workflowValidators/description.validator.ts` |
| A | `packages/shared/validators/workflowValidators/name.validator.ts` |
| M | `packages/shared/validators/zodSchemes.ts` |
| A | `packages/shared/workflow-dsl/config.ts` |
| A | `packages/shared/workflow-dsl/graph.schema.ts` |
| A | `packages/shared/workflow-dsl/index.ts` |
| A | `packages/shared/workflow-dsl/types.ts` |

### Root / Config

| Status | File |
|--------|------|
| M | `.gitignore` |
| M | `biome.json` |
| M | `bun.lock` |
| M | `bunfig.toml` |
| A | `fly.staging.toml` |
| M | `fly.toml` |
| M | `package.json` |
| M | `tsconfig.base.json` |
