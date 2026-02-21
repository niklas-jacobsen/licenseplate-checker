import { describe, expect, it, mock, beforeEach, spyOn, afterAll, beforeAll } from 'bun:test'
import { Hono } from 'hono'
import { errorHandler } from '../app'

import CityController from '../controllers/City.controller'
import LicenseplateCheckController from '../controllers/LicensePlateCheck.controller'

let cityGetByIdSpy: any
let checkCreateSpy: any
let checkGetByUserIdSpy: any
let checkDeleteSpy: any
let checkGetByIdSpy: any

// mock env variable
type AppEnv = {
    Variables: {
        user: { id: string }
    }
}

async function makeApp(setupMiddleware?: (app: Hono<AppEnv>) => void) {
  const { licensePlateCheckRouter } = await import('./licensePlateCheck.routes')
  const app = new Hono<AppEnv>()
  if (setupMiddleware) {
      setupMiddleware(app)
  }
  app.onError(errorHandler)
  app.route('/check', licensePlateCheckRouter)
  return app
}


describe('License Plate Check Routes', () => {
  beforeAll(() => {
    cityGetByIdSpy = spyOn(CityController.prototype, 'getById')
    checkCreateSpy = spyOn(LicenseplateCheckController.prototype, 'createCheck')
    checkGetByUserIdSpy = spyOn(LicenseplateCheckController.prototype, 'getByUserId')
    checkDeleteSpy = spyOn(LicenseplateCheckController.prototype, 'deleteCheck')
    checkGetByIdSpy = spyOn(LicenseplateCheckController.prototype, 'getById')
  })

  afterAll(() => {
      mock.restore()
  })

  beforeEach(() => {
    cityGetByIdSpy.mockClear()
    checkCreateSpy.mockClear()
    checkGetByUserIdSpy.mockClear()
    checkDeleteSpy.mockClear()
    checkGetByIdSpy.mockClear()
  })

  describe('POST /check/new', () => {
    it('creates a new check successfully', async () => {
      const app = await makeApp((app) => {
        app.use('*', async (c, next) => {
            c.set('user', { id: 'user1' })
            await next()
        })
      })
      const payload = { city: 'HAM', letters: 'AB', numbers: '123' }

      cityGetByIdSpy.mockResolvedValue({ id: 'HAM', name: 'Hamburg' })
      checkCreateSpy.mockResolvedValue({ id: 'check1', ...payload, numbers: 123, userId: 'user1' })

      const res = await app.request('/check/new', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.message).toContain('created successfully')
      expect(cityGetByIdSpy).toHaveBeenCalledWith('HAM')
      expect(checkCreateSpy).toHaveBeenCalledWith({
          cityId: 'HAM',
          letters: 'AB',
          numbers: 123,
          userId: 'user1'
      })
    })

    it('returns 400 if city not found', async () => {
        const app = await makeApp((app) => {
            app.use('*', async (c, next) => {
                c.set('user', { id: 'user1' })
                await next()
            })
        })
        const payload = { city: 'UNK', letters: 'AB', numbers: '123' }
  
        cityGetByIdSpy.mockResolvedValue(null)
  
        const res = await app.request('/check/new', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        })

        expect(res.status).toBe(400)
        expect(cityGetByIdSpy).toHaveBeenCalledWith('UNK')
        expect(checkCreateSpy).not.toHaveBeenCalled()
    })
  })

  describe('GET /check/me', () => {
      it('returns user checks', async () => {
          const app = await makeApp((app) => {
            app.use('*', async (c, next) => {
                c.set('user', { id: 'user1' })
                await next()
            })
          })

          checkGetByUserIdSpy.mockResolvedValue([{ id: 'c1' }])

          const res = await app.request('/check/me')
          expect(res.status).toBe(200)
          const body = await res.json()
          expect(body.checks).toHaveLength(1)
      })

      it('returns 404 if no checks found', async () => {
        const app = await makeApp((app) => {
            app.use('*', async (c, next) => {
                c.set('user', { id: 'user1' })
                await next()
            })
        })

        checkGetByUserIdSpy.mockResolvedValue([])

        const res = await app.request('/check/me')
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.checks).toHaveLength(0)
    })
  })

  describe('DELETE /check/delete/:id', () => {
      it('deletes user check', async () => {
          const app = await makeApp((app) => {
            app.use('*', async (c, next) => {
                c.set('user', { id: 'user1' })
                await next()
            })
          })

          checkGetByIdSpy.mockResolvedValue({ id: 'c1', userId: 'user1' })
          checkDeleteSpy.mockResolvedValue({ id: 'c1' })

          const res = await app.request('/check/delete/c1', { method: 'DELETE' })
          expect(res.status).toBe(200)
          expect(checkDeleteSpy).toHaveBeenCalledWith('c1')
      })

      it('returns 404 if check not found or not owned by user', async () => {
        const app = await makeApp((app) => {
            app.use('*', async (c, next) => {
                c.set('user', { id: 'user1' })
                await next()
            })
        })

        checkGetByIdSpy.mockResolvedValue({ id: 'c1', userId: 'otherUser' })

        const res = await app.request('/check/delete/c1', { method: 'DELETE' })
        expect(res.status).toBe(404)
        expect(checkDeleteSpy).not.toHaveBeenCalled()
    })
  })
})
