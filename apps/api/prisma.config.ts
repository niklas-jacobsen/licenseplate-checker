import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// Prisma 7 no longer reads connection URLs from schema.prisma. This config is
// only used by the Prisma CLI (migrate, db push, studio, ...), which must talk
// to Postgres over a direct connection: pgBouncer in transaction mode can't run
// migrations. The runtime client connects through the pooler instead, see
// prisma/data-source.ts.
//
// `prisma generate` doesn't need a database, so the URL may be absent there
// (e.g. during the Docker build); `process.env` is used instead of `env()`
// because `env()` throws when the variable is missing.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DIRECT_DATABASE_URL,
  },
})
