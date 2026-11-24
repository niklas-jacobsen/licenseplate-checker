import { readFileSync } from 'node:fs'
import path from 'node:path'
import { mock } from 'bun:test'
import * as runtime from '@prisma/client/runtime/client'
import type { PrismaClient } from '../src/generated/prisma/client'

/**
 * In-memory Prisma client for tests, backed by prismock.
 *
 * prismock 1.x was written for Prisma 5: it imports `@prisma/client` (which
 * Prisma 7 no longer generates into) and `@prisma/client/runtime/library`
 * (renamed to `runtime/client`), and it reads the data model from
 * `Prisma.dmmf` (which the new `prisma-client` generator doesn't emit). The
 * shims below cover those three gaps until prismock supports Prisma 7.
 */
export async function createMockClient(): Promise<PrismaClient> {
  mock.module('@prisma/client/runtime/library', () => runtime)
  mock.module('@prisma/client', () => ({ Prisma: {} }))

  const { createPrismock } = await import('prismock/build/main/lib/client')
  // prismock's own @prisma/internals (5.22) still requires a `url` in the
  // datasource block, which Prisma 7 moved to prisma.config.ts.
  const { getDMMF } = await import('@prisma/internals')

  const schema = readFileSync(
    path.resolve(import.meta.dir, 'schema.prisma'),
    'utf8',
  ).replace(
    /(datasource\s+\w+\s*\{)/,
    '$1\n  url = "postgresql://mock:mock@localhost:5432/mock"',
  )
  const dmmf = await getDMMF({ datamodel: schema })

  // biome-ignore lint/suspicious/noExplicitAny: prismock only reads dmmf.datamodel from the Prisma namespace
  const PrismockClient = createPrismock({ dmmf } as any)
  return new PrismockClient() as unknown as PrismaClient
}
