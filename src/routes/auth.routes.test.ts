import { it, expect, describe, beforeAll, afterAll } from 'bun:test';
import { Hono } from 'hono';
import { authRouter } from './auth.routes';
import { ENV } from '../env';

const app = new Hono();
app.route('/auth', authRouter);

const jwtSecret = ENV.JWT_SECRET;
const allowedOrigins = ENV.ALLOWED_ORIGINS;

describe('POST /auth/register', () => {
  beforeAll(() => {
    ENV.JWT_SECRET = 'jwt_secret';

    ENV.ALLOWED_ORIGINS = [
      'http://localhost:3001',
      'http://localhost:3000',
      'http://localhost:8080',
    ];
  });

  it('should register a new user successfully', async () => {
    const res = await app.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123$',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('email', 'test@example.com');
  });

  it('should return 400 if user already exists', async () => {
    // First, register the user
    await app.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'Password123$',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    // Try to register again with the same email
    const res = await app.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'Password123$',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: 'User already exists' });
  });

  it('should return 400 if validation fails', async () => {
    const res = await app.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'not-an-email', password: 'short' }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty('error');
  });
});

describe('POST /auth/login', () => {
  it('should login an existing user successfully', async () => {
    // First, register the user
    await app.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'login@example.com',
        password: 'Password123$',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    // Then login
    const res = await app.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'login@example.com',
        password: 'Password123$',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('message', 'User logged in');
    expect(json).toHaveProperty('token');
  });

  it('should return 400 if user does not exist', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'Password123$',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: 'User does not exists' });
  });

  it('should return 400 if password is incorrect', async () => {
    // First, register the user
    await app.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'wrongpass@example.com',
        password: 'Password123$',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    // Then attempt to login with wrong password
    const res = await app.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'wrongpass@example.com',
        password: 'WrongPassword123$',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: 'Incorrect password' });
  });

  it('should return 400 if validation fails', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'not-an-email', password: '' }),
      headers: { 'Content-Type': 'application/json' },
    });
  });

  afterAll(() => {
    ENV.JWT_SECRET = jwtSecret;
    ENV.ALLOWED_ORIGINS = allowedOrigins;
  });
});
