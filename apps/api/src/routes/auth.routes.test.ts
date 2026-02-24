import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { Hono } from 'hono'
import { ENV } from '../env'
import { authRouter } from './auth.routes'
import { userRouter } from './user.routes'

import { errorHandler } from '../app'

const app = new Hono()
app.onError(errorHandler)
app.route('/auth', authRouter)

const jwtSecret = ENV.JWT_SECRET
const allowedOrigins = ENV.ALLOWED_ORIGINS

describe('POST /auth/register', () => {
  beforeAll(() => {
    ENV.JWT_SECRET = 'jwt_secret'

    ENV.ALLOWED_ORIGINS = [
      'http://localhost:3001',
      'http://localhost:3000',
      'http://localhost:8080',
    ]
  })

  it('should register a new user successfully', async () => {
    const email = `test-${Date.now()}@example.com`
    const res = await app.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password: 'Password123$',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveProperty('message', 'User created and logged in')
  })

  it('should return 400 if user already exists', async () => {
    // First, register the user
    await app.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'Password123$',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    // Try to register again with the same email
    const res = await app.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'Password123$',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json).toEqual({
      ok: false,
      error: {
        code: 'USER_ALREADY_EXISTS',
        message: 'User already exists',
      },
    })

  })

  it('should return 400 if validation fails', async () => {
    const res = await app.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'not-an-email', password: 'short' }),
      headers: { 'Content-Type': 'application/json' },
    })

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toHaveProperty('error')
  })
})

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
    })

    // Then login
    const res = await app.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'login@example.com',
        password: 'Password123$',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveProperty('message', 'User logged in')
    expect(json).toHaveProperty('token')
  })

  it('should return 400 if user does not exist', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'Password123$',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toEqual({
      ok: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User does not exist',
      },
    })
  })

  it('should return 400 if password is incorrect', async () => {
    // First, register the user
    await app.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'wrongpass@example.com',
        password: 'Password123$',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    // Then attempt to login with wrong password
    const res = await app.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'wrongpass@example.com',
        password: 'WrongPassword123$',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toEqual({
      ok: false,
      error: {
        code: 'INCORRECT_PASSWORD',
        message: 'Incorrect password',
      },
    })
  })

  afterAll(() => {
    ENV.JWT_SECRET = jwtSecret
    ENV.ALLOWED_ORIGINS = allowedOrigins
  })
})

describe('e2e: register → login → get profile', () => {
  const e2eApp = new Hono()
  e2eApp.onError(errorHandler)
  e2eApp.route('/auth', authRouter)
  e2eApp.route('/user', userRouter)

  const email = `e2e-${Date.now()}@example.com`
  const password = 'E2ePassword123$'
  let token: string

  beforeAll(() => {
    ENV.JWT_SECRET = 'e2e-jwt-secret'
  })

  it('registers a new user', async () => {
    const res = await e2eApp.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.token).toBeDefined()
    token = json.token
  })

  it('logs in with the same credentials', async () => {
    const res = await e2eApp.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.token).toBeDefined()
    token = json.token
  })

  it('fetches the authenticated user profile', async () => {
    const res = await e2eApp.request('/user/me', {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.email).toBe(email)
    expect(json.password).toBeUndefined()
  })
})
