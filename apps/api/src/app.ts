import { Hono, ErrorHandler } from 'hono'
import { secureHeaders } from 'hono/secure-headers'
import auth from './middleware/auth'
import corsMiddleware from './middleware/cors'
import csrfMiddleware from './middleware/csrf'
import limiter from './middleware/rateLimiter'
import router from './routes'

const app = new Hono()
app.use(
  secureHeaders({
    xContentTypeOptions: 'nosniff',
    crossOriginOpenerPolicy: 'same-origin',
    referrerPolicy: 'no-referrer',
    xXssProtection: false,
    xFrameOptions: false,
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      frameAncestors: ["'self'"],
      fontSrc: ["'self'"],
      imgSrc: ["'self'"],
    },
  })
)
app.use('*', corsMiddleware)
app.use('*', limiter)
app.use('*', csrfMiddleware)
app.use('/user/*', auth)
app.use('/request/*', auth)
import { AppError } from '@licenseplate-checker/shared/types'

export const errorHandler: ErrorHandler = (err, c) => {
  // AppError by instanceof or using duck typing (statusCode + code)
  if (err instanceof AppError || ((err as any).statusCode && (err as any).code)) {
    const appError = err as any
    return c.json(
      {
        ok: false,
        error: {
          code: appError.code,
          message: appError.message,
          details: appError.details,
        },
      },
      appError.statusCode
    )
  }

  console.error('Unhandled error:', err)
  return c.json(
    {
      ok: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal Server Error',
      },
    },
    500
  )
}

app.onError(errorHandler)
app.route('', router)
export default app
