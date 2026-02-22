import * as Sentry from '@sentry/bun'

Sentry.init({
  dsn: 'https://99b80168ff334e9bd6a77ceb04b6d8b9@o4510930471026688.ingest.us.sentry.io/4510930544033792',
  environment: process.env.SENTRY_ENVIRONMENT || 'development',
  enabled: process.env.NODE_ENV === 'production',
  sendDefaultPii: true,
})
