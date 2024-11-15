import app from './app';
import { ENV } from './env';

export default {
  port: ENV.PORT,
  fetch: app.fetch,
};
