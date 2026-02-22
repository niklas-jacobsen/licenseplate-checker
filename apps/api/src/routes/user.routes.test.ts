import {
  describe,
  expect,
  it,
  mock,
  beforeEach,
  spyOn,
  beforeAll,
  afterAll,
} from 'bun:test'
import { Hono } from 'hono'
import { errorHandler } from '../app'
import UserController from '../controllers/User.controller'
import AuthController from '../controllers/Authorization.controller'

let getByIdSpy: any
let updateSpy: any
let verifyJWTSpy: any

type AppEnv = {
  Variables: {
    user: { id: string }
    token: string
  }
}

async function makeApp() {
  const { userRouter } = await import('./user.routes')
  const app = new Hono<AppEnv>()
  app.onError(errorHandler)
  app.route('/user', userRouter)
  return app
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: 'Bearer fake-token',
}

const fullUser = {
  id: 'user-1',
  email: 'test@example.com',
  password: 'hashed-password',
  firstname: 'Max',
  lastname: 'Mustermann',
  street: 'Musterstraße',
  streetNumber: '42',
  zipcode: 12345,
  city: 'Berlin',
  salutation: 'HERR',
  birthdate: new Date('1990-01-01'),
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('User Routes', () => {
  beforeAll(() => {
    getByIdSpy = spyOn(UserController.prototype, 'getById')
    updateSpy = spyOn(UserController.prototype, 'update')
    verifyJWTSpy = spyOn(AuthController.prototype, 'verifyJWT')
  })

  afterAll(() => {
    mock.restore()
  })

  beforeEach(() => {
    getByIdSpy.mockClear()
    updateSpy.mockClear()
    verifyJWTSpy.mockClear()
    verifyJWTSpy.mockResolvedValue({ id: 'user-1' })
  })

  describe('GET /user/me', () => {
    it('returns user without password field', async () => {
      const app = await makeApp()
      getByIdSpy.mockResolvedValue(fullUser)

      const res = await app.request('/user/me', { headers })
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body.email).toBe('test@example.com')
      expect(body.firstname).toBe('Max')
      expect(body.password).toBeUndefined()
    })

    it('returns 404 when user not found', async () => {
      const app = await makeApp()
      getByIdSpy.mockResolvedValue(null)

      const res = await app.request('/user/me', { headers })
      expect(res.status).toBe(404)
    })
  })

  describe('PUT /user/me', () => {
    it('updates user fields and excludes sensitive fields from response', async () => {
      const app = await makeApp()
      const updated = { ...fullUser, firstname: 'Moritz' }
      getByIdSpy.mockResolvedValue(fullUser)
      updateSpy.mockResolvedValue(updated)

      const origLog = console.log
      console.log = mock(() => {
        /* linter supression comment */
      })

      const res = await app.request('/user/me', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ firstname: 'Moritz' }),
      })

      console.log = origLog

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.firstname).toBe('Moritz')
      expect(body.password).toBeUndefined()
      expect(body.birthdate).toBeUndefined()
      expect(body.salutation).toBeUndefined()
      expect(body.createdAt).toBeUndefined()
    })

    it('returns 400 for invalid zipCode', async () => {
      const app = await makeApp()

      const res = await app.request('/user/me', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ zipCode: '123' }),
      })

      expect(res.status).toBe(400)
    })

    it('returns 400 for extra unknown fields (strict mode)', async () => {
      const app = await makeApp()

      const res = await app.request('/user/me', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ unknownField: 'value' }),
      })

      expect(res.status).toBe(400)
    })

    it('returns 404 when update returns null', async () => {
      const app = await makeApp()
      getByIdSpy.mockResolvedValue(fullUser)
      updateSpy.mockResolvedValue(null)

      const origLog = console.log
      console.log = mock(() => {
        /* suppress route log */
      })

      const res = await app.request('/user/me', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ firstname: 'Test' }),
      })

      console.log = origLog

      expect(res.status).toBe(404)
    })
  })
})
