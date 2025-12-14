import { PrismaClient } from '@prisma/client'
import { PrismockClient } from 'prismock'
import { ENV } from '../src/env'

declare global {
  var __db: PrismaClient | undefined
}

let prisma: PrismaClient

if (ENV.NODE_ENV === 'test') {
  console.log('Using mock client')
  prisma = new PrismockClient()
} else {
  prisma = new PrismaClient({
    datasourceUrl: ENV.DATABASE_URL,
  })
}

if (ENV.NODE_ENV === 'production') {
  prisma = new PrismaClient({ log: ['error'] })
  prisma.$connect()
} else {
  if (!global.__db) {
    global.__db = new PrismaClient({ log: ['error', 'warn'] })
    global.__db.$connect()
  }
  prisma = global.__db
}

export { prisma }
