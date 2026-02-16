import { describe, expect, it, mock, beforeEach, spyOn } from 'bun:test'
import { Hono } from 'hono'

import { IrExecutor } from '../builder/execution/IrExecutor'

// Mock dependencies
mock.module('../builder/compiler/GraphToIrCompiler', () => ({
  compileGraphToIr: mock(() => ({})),
}))

mock.module('../types/compiler.types', () => ({
  CompileError: class extends Error {},
}))

mock.module('../builder/registry', () => ({
    BUILDER_REGISTRY_VERSION: 'v1',
    nodeRegistry: {},
}))

import { errorHandler } from '../app'
import { builderRouter } from './builder.routes'

function makeApp() {
  const app = new Hono()
  app.onError(errorHandler)
  app.route('/builder', builderRouter)
  return app
}

describe('POST /builder/execute', () => {
  let executorSpy: any

  beforeEach(() => {
    executorSpy = spyOn(IrExecutor.prototype, 'execute')
  })

  it('returns 400 when request body is not JSON', async () => {
    const app = makeApp()
    const res = await app.request('/builder/execute', {
      method: 'POST',
      body: '{invalid json',
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.ok).toBe(false)
  })

  it('executes IR and returns result', async () => {
    const app = makeApp()
    const ir = { entryBlockId: 'start', blocks: {} }
    
    executorSpy.mockResolvedValueOnce({ 
        success: true, 
        logs: [{ level: 'info', message: 'test', timestamp: 'now' }] 
    })

    const res = await app.request('/builder/execute', {
      method: 'POST',
      body: JSON.stringify(ir),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.logs).toHaveLength(1)
    expect(executorSpy).toHaveBeenCalledTimes(1)
    expect(executorSpy).toHaveBeenCalledWith(ir)
  })

  it('handles execution errors', async () => {
    const app = makeApp()
    executorSpy.mockRejectedValueOnce(new Error('Execution failed'))

    const res = await app.request('/builder/execute', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.error.code).toBe('EXECUTION_ERROR')
  })
})
