import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Hono } from 'hono'

const validateGraphMock = mock(() => ({
  ok: true as boolean,
  graph: {} as any,
  issues: [] as any[],
}))

const compileGraphToIrMock = mock(() => ({
  irVersion: 'v1',
  registryVersion: 'v1',
  entryBlockId: 'b_start',
  blocks: {},
}))
import { CompileError } from '../types/compiler.types'

mock.module('../middleware/auth', () => ({
  default: mock(async (c: any, next: any) => {
    c.set('user', { id: 'test-user-id' })
    await next()
  }),
}))

mock.module('@trigger.dev/sdk/v3', () => ({
  tasks: {
    trigger: mock(),
  },
}))

mock.module('../env', () => ({
  ENV: {
    API_BASE_URL: 'http://localhost:8080',
    TRIGGER_WEBHOOK_SECRET: 'test-secret',
  },
}))

import { tasks } from '@trigger.dev/sdk/v3'
import { errorHandler } from '../app'
import { createBuilderRouter } from './builder.routes'

const workflowControllerMock = {
  create: mock(),
  getById: mock(),
  createExecution: mock(),
  updateExecution: mock(),
  countByAuthor: mock(),
} as any

function makeApp() {
  const app = new Hono()
  app.onError(errorHandler)
  app.route(
    '/builder',
    createBuilderRouter(
      workflowControllerMock,
      validateGraphMock as any,
      compileGraphToIrMock as any
    )
  )
  return app
}

describe('builder routes', () => {
  beforeEach(() => {
    validateGraphMock.mockClear()
    compileGraphToIrMock.mockClear()
  })

  describe('GET /builder/registry', () => {
    it('returns registry version and node metadata', async () => {
      const app = makeApp()
      const res = await app.request('/builder/registry')
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.version).toBeDefined()
      expect(body.nodes.length).toBeGreaterThanOrEqual(2)
      expect(body.nodes.some((n: any) => n.type === 'core.start')).toBe(true)
      expect(body.nodes.some((n: any) => n.type === 'core.end')).toBe(true)
    })
  })

  describe('POST /builder/validate', () => {
    it('returns 400 when request body is not JSON', async () => {
      const app = makeApp()
      const res = await app.request('/builder/validate', {
        method: 'POST',
        body: '{not valid json',
      })
      expect(res.status).toBe(400)
    })

    it('returns 400 when validateGraph returns ok false', async () => {
      validateGraphMock.mockReturnValueOnce({
        ok: false,
        issues: [{ type: 'graph.parse', message: 'error' }],
      } as any)

      const app = makeApp()
      const res = await app.request('/builder/validate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: 'g1' }),
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body).toEqual({
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Graph validation failed',
          details: {
            issues: [{ type: 'graph.parse', message: 'error' }],
          },
        },
      })
    })

    it('returns 200 when validateGraph returns ok true', async () => {
      validateGraphMock.mockReturnValueOnce({
        ok: true,
        graph: {},
        issues: [],
      } as any)

      const app = makeApp()
      const res = await app.request('/builder/validate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: 'g1' }),
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual({
        ok: true,
        issues: [],
      })
    })
  })

  describe('POST /builder/compile', () => {
    it('returns 400 when request body is not JSON', async () => {
      const app = makeApp()
      const res = await app.request('/builder/compile', {
        method: 'POST',
        body: '{not valid json',
      })
      expect(res.status).toBe(400)
    })

    it('returns 400 when compileGraphToIr throws CompileError', async () => {
      compileGraphToIrMock.mockImplementationOnce(() => {
        throw new CompileError('Compilation failed', [
          { type: 'node.missingNext', message: 'Missing next', nodeId: 'n1' },
        ])
      })

      const app = makeApp()
      const res = await app.request('/builder/compile', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: 'g1' }),
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.ok).toBe(false)
      expect(body.error.code).toBe('COMPILE_ERROR')
      expect(body.error.details.issues).toEqual([
        { type: 'node.missingNext', message: 'Missing next', nodeId: 'n1' },
      ])
    })

    it('returns 200 and ir when compilation succeeds', async () => {
      compileGraphToIrMock.mockImplementationOnce(() => ({
        irVersion: 'v1',
        registryVersion: 'v1',
        entryBlockId: 'b_start',
        blocks: {},
      }))

      const app = makeApp()
      const res = await app.request('/builder/compile', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: 'g1' }),
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.ok).toBe(true)
      expect(body.ir.irVersion).toBe('v1')
    })
  })
})
