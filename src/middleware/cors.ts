import { createMiddleware } from 'hono/factory';
import { cors } from 'hono/cors';
import { Context, Next } from 'hono';
import { ENV } from '../env';

const corsMiddleware = cors({
  origin: ENV.ALLOWED_ORIGINS,
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
});

export default corsMiddleware;
