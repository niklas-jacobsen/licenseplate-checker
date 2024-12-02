import { createMiddleware } from 'hono/factory';
import { csrf } from 'hono/csrf';
import { Context, Next } from 'hono';
import { ENV } from '../env';

const csrfMiddleware = createMiddleware(
  async (
    _c: Context,
    next: Next,
    allowedOrigins: string[] = ENV.ALLOWED_ORIGINS
  ) => {
    csrf({
      origin: allowedOrigins,
    });
    await next();
  }
);

export default csrfMiddleware;
