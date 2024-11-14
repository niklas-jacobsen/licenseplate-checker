import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { auth } from './middleware/auth';
import limiter from './middleware/rateLimiter';
import router from './routes';

const app = new Hono();
app.use(secureHeaders());
app.use(limiter);
app.use('/user/*', auth);

app.route('', router);
export default app;
