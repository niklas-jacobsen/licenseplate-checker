import { test, it, expect, describe } from 'bun:test';
import { Hono } from 'hono';
import { indexRouter } from './index.routes';

const app = new Hono();
app.route('/', indexRouter);

describe('When GET /', async () => {
  const res = await app.request('/');

  it('should return status 200', async () => {
    expect(res.status).toBe(200);
  });

  it('should return the correct JSON response', async () => {
    const json = await res.json();
    expect(json).toEqual({ message: 'Licenseplate-Checker running' });
  });
});
