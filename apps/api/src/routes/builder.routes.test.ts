import { describe, expect, it, mock, beforeEach } from 'bun:test'
import { Hono } from 'hono'

const validateGraphMock = mock(() => ({
  ok: true as boolean,
  graph: {} as any,
  issues: [] as any[],
}))
mock.module('../builder/validate/validateGraph', () => {
  return {
    validateGraph: validateGraphMock,
  }
})

const compileGraphToIrMock = mock(() => ({
  irVersion: 'v1',
  registryVersion: 'v1',
  entryBlockId: 'b_start',
  blocks: {},
}))

import { CompileError } from '../types/compiler.types'

mock.module('../builder/compiler/GraphToIrCompiler', () => {
  return {
    compileGraphToIr: compileGraphToIrMock,
    CompileError,
  }
})

mock.module('@licenseplate-checker/shared/node-registry', () => {
  return {
    BUILDER_REGISTRY_VERSION: 'v1',
    nodeRegistry: {
      'core.start': {
        type: 'core.start',
        label: 'Start',
        category: 'Flow',
        inputs: [],
        outputs: [{ id: 'next' }],
        propsSchema: { safeParse: () => ({ success: true }) },
      },
      'core.end': {
        type: 'core.end',
        label: 'End',
        category: 'Flow',
        inputs: [{ id: 'in' }],
        outputs: [],
        propsSchema: { safeParse: () => ({ success: true }) },
      },
    },
  }
})


import { errorHandler } from '../app'
import { builderRouter } from './builder.routes'

function makeApp() {
  const app = new Hono()
  app.onError(errorHandler)
  app.route('/builder', builderRouter)
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
      expect(body.version).toBe('v1')
      expect(body.nodes).toEqual(expect.arrayContaining([
        expect.objectContaining({ type: 'core.start' }),
        expect.objectContaining({ type: 'core.end' }),
      ]))
    })
  })

  describe('POST /builder/validate', () => {
    it('returns 400 when request body is not JSON', async () => {
      const app = makeApp()

      const res = await app.request('/builder/validate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{not valid json',
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.ok).toBe(false)
      expect(body.error.code).toBe('INVALID_JSON')
    })

    it('returns 400 when validateGraph returns ok false', async () => {
      validateGraphMock.mockImplementationOnce(() => ({
        ok: false,
        graph: {},
        issues: [{ type: 'graph.parse', message: 'bad' }],
      }))

      const app = makeApp()

      const res = await app.request('/builder/validate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ any: 'payload' }),
      })

      expect(res.status).toBe(400)

      const body = await res.json()
      expect(body.ok).toBe(false)
      expect(body.error.code).toBe('VALIDATION_ERROR')
      expect(body.error.details.issues).toEqual([{ type: 'graph.parse', message: 'bad' }])

      expect(validateGraphMock).toHaveBeenCalledTimes(1)
    })

    it('returns 200 when validateGraph returns ok true', async () => {
      validateGraphMock.mockImplementationOnce(() => ({
        ok: true as const,
        graph: { id: 'g1' } as any,
        issues: [],
      }))

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

      expect(validateGraphMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('POST /builder/compile', () => {
    it('returns 400 when request body is not JSON', async () => {
      const app = makeApp()

      const res = await app.request('/builder/compile', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{not valid json',
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.ok).toBe(false)
      expect(body.error.code).toBe('INVALID_JSON')
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

      expect(compileGraphToIrMock).toHaveBeenCalledTimes(1)
    })

    it('returns 200 and ir when compilation succeeds', async () => {
      compileGraphToIrMock.mockImplementationOnce(() => ({
        irVersion: 'v1',
        registryVersion: 'v1',
        entryBlockId: 'b_start',
        blocks: {
          b_start: {
            id: 'b_start',
            kind: 'start',
            sourceNodeId: 'start',
            next: 'b_end',
          },
        },
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
      expect(body.ir.entryBlockId).toBe('b_start')

      expect(compileGraphToIrMock).toHaveBeenCalledTimes(1)
    })
  })
})
