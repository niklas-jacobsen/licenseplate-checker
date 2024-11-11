import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { PrismockClient } from 'prismock';

dotenv.config();

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'test') {
  console.log('Using mock client');
  prisma = new PrismockClient();
} else {
  prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });
}

export { prisma };
