import app from './app';

const PORT = process.env.PORT || 8080;

export default {
  port: PORT,
  fetch: app.fetch,
};
