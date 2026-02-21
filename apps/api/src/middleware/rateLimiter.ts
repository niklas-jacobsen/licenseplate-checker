import { rateLimiter } from 'hono-rate-limiter'
import { ENV } from '../env'

const limiter = rateLimiter({
  windowMs: ENV.RATE_LIMIT_WINDOW,
  limit: ENV.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: false,
  keyGenerator: (c) =>
    c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
  skip: (c) => {
    if (c.req.path.startsWith('/webhooks/')) return true
    const ua = c.req.header('User-Agent') || ''
    return ua.includes('Trigger')
  },
})

export default limiter
