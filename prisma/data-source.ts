import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { PrismockClient } from 'prismock';
import { ENV } from '../src/env';

let prisma: PrismaClient;
if (ENV.NODE_ENV === 'test') {
  console.log('Using mock client');
  prisma = new PrismockClient();
} else {
  prisma = new PrismaClient({
    datasourceUrl: ENV.DATABASE_URL,
  });
}

export { prisma };
