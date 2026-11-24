import { PrismaPg } from '@prisma/adapter-pg'
import type { PoolConfig } from 'pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { ENV } from '../src/env'

declare global {
  var __db: PrismaClient | undefined
}

// Query parameters that only Prisma's old Rust engine understood. node-postgres
// would ignore or misread them, so they are stripped from DATABASE_URL and the
// ones that still matter are mapped onto the pg pool config.
const PRISMA_ONLY_URL_PARAMS = [
  'pgbouncer',
  'connection_limit',
  'pool_timeout',
  'statement_cache_size',
  'schema',
]

/**
 * Builds the driver adapter for the runtime client. At runtime the API talks to
 * Supabase through the pgBouncer pooler (transaction mode). That works with
 * @prisma/adapter-pg as-is: it only sends unnamed prepared statements, so the
 * old `?pgbouncer=true` flag is no longer needed.
 */
export function createAdapter(databaseUrl: string) {
  const url = new URL(databaseUrl)
  const params = url.searchParams

  const poolConfig: PoolConfig = {}
  const connectionLimit = Number(params.get('connection_limit'))
  if (connectionLimit > 0) poolConfig.max = connectionLimit
  const poolTimeoutSeconds = Number(params.get('pool_timeout'))
  if (poolTimeoutSeconds > 0) {
    poolConfig.connectionTimeoutMillis = poolTimeoutSeconds * 1000
  }
  const schema = params.get('schema') ?? undefined

  for (const param of PRISMA_ONLY_URL_PARAMS) params.delete(param)
  poolConfig.connectionString = url.toString()

  return new PrismaPg(poolConfig, schema ? { schema } : undefined)
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'test') {
  console.log('Using mock client')
  const { createMockClient } = await import('./mock-client')
  prisma = await createMockClient()
} else if (ENV.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    adapter: createAdapter(ENV.DATABASE_URL),
    log: ['error'],
  })
} else {
  if (!global.__db) {
    global.__db = new PrismaClient({
      adapter: createAdapter(ENV.DATABASE_URL),
      log: ['error', 'warn'],
    })
  }
  prisma = global.__db
}

export { prisma }
