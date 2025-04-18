import { cors } from 'hono/cors'
import { ENV } from '../env'

const corsMiddleware = cors({
  origin: ENV.ALLOWED_ORIGINS,
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
})

export default corsMiddleware
