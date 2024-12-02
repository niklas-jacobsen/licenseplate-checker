import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import auth from './middleware/auth';
import limiter from './middleware/rateLimiter';
import corsMiddleware from './middleware/cors';
import router from './routes';
import csrfMiddleware from './middleware/csrf';

const app = new Hono();
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
);
app.use('*', limiter);
app.use('*', corsMiddleware);
app.use('*', csrfMiddleware);
app.use('/user/*', auth);
app.use('/request/*', auth);
app.route('', router);
export default app;
