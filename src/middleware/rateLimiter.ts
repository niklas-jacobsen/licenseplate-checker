import { rateLimiter } from 'hono-rate-limiter';
import { ENV } from '../env';

const limiter = rateLimiter({
  windowMs: ENV.RATE_LIMIT_WINDOW,
  limit: ENV.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: 'draft-6',
  keyGenerator: (c) => c.req.header('x-forwarded-for') ?? '',
});

export default limiter;
