import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import limiter from './middleware/rateLimiter';
import router from './routes';

const app = new Hono();
app.use(secureHeaders());
app.use(limiter);

app.route('', router);
export default app;
