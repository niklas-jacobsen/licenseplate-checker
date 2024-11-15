import { createMiddleware } from 'hono/factory';
import { cors } from 'hono/cors';
import { Context, Next } from 'hono';
import { ENV } from '../env';

const corsMiddleware = createMiddleware(async (_c: Context, next: Next) => {
  cors({
    origin: ENV.ALLOWED_ORIGINS,
  });
  await next();
});

export default corsMiddleware;
