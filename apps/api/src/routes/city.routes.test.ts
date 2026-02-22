import { describe, expect, it, mock } from 'bun:test'
import { Hono } from 'hono'
import { createCityRouter } from './city.routes'

// Mock controller setup
const mockController = {
  getAll: mock(() => Promise.resolve([{ id: 'B', name: 'Berlin' }])),
  create: mock(),
  getById: mock(),
  updateWebsiteUrl: mock(),
  updateAllowedDomains: mock(),
} as any

describe('GET /cities', () => {
  it('returns list of cities', async () => {
    mockController.getAll.mockResolvedValue([{ id: 'B', name: 'Berlin' }])
    const router = createCityRouter(mockController)
    const app = new Hono()
    app.route('/', router)

    const res = await app.request('/')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.cities).toHaveLength(1)
    expect(body.cities[0]).toEqual({ id: 'B', name: 'Berlin' })
  })

  it('handles errors', async () => {
    //mock error to clean up scary error trace when running tests
    const originalError = console.error
    console.error = mock(() => {
      /* comment to satisfy linter */
    })

    mockController.getAll.mockImplementation(async () => {
      throw new Error('DB Error')
    })
    const router = createCityRouter(mockController)
    const app = new Hono()
    app.route('/', router)

    const res = await app.request('/')
    expect(res.status).toBe(500)

    console.error = originalError
  })
})
