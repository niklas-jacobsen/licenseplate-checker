import { describe, expect, it, mock, beforeEach } from 'bun:test'
import { Hono } from 'hono'

mock.module('../builder/compiler/GraphToIrCompiler', () => ({
  compileGraphToIr: mock(() => ({ entryBlockId: 'start', blocks: {} })),
}))

mock.module('../types/compiler.types', () => ({
  CompileError: class extends Error {},
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

mock.module('../middleware/auth', () => ({
  default: mock(async (c: any, next: any) => {
    c.set('user', { id: 'test-user-id' })
    await next()
  }),
}))

import { errorHandler } from '../app'
import { createBuilderRouter } from './builder.routes'
import { tasks } from '@trigger.dev/sdk/v3'

const mockWorkflowController = {
  getById: mock(),
  createExecution: mock(),
  updateExecution: mock(),
} as any

function makeApp() {
  const app = new Hono()
  app.onError(errorHandler)
  app.route('/builder', createBuilderRouter(mockWorkflowController))
  return app
}

describe('POST /builder/execute', () => {
  beforeEach(() => {
    mockWorkflowController.getById.mockReset()
    mockWorkflowController.createExecution.mockReset()
    mockWorkflowController.updateExecution.mockReset()
    ;(tasks.trigger as any).mockReset()
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

  it('returns 400 when workflowId is missing', async () => {
    const app = makeApp()
    const res = await app.request('/builder/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.code).toBe('MISSING_WORKFLOW_ID')
  })

  it('returns 400 when workflow not found', async () => {
    const app = makeApp()
    mockWorkflowController.getById.mockResolvedValueOnce(null)

    const res = await app.request('/builder/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId: 'nonexistent' }),
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.code).toBe('WORKFLOW_NOT_FOUND')
  })

  it('returns 400 when workflow is not published', async () => {
    const app = makeApp()
    mockWorkflowController.getById.mockResolvedValueOnce({
      id: 'wf-1',
      definition: { nodes: [], edges: [] },
      isPublished: false,
      city: { allowedDomains: ['example.com'] },
    })

    const res = await app.request('/builder/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId: 'wf-1' }),
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.code).toBe('WORKFLOW_NOT_PUBLISHED')
  })

  it('triggers execution and returns 202', async () => {
    const app = makeApp()

    mockWorkflowController.getById.mockResolvedValueOnce({
      id: 'wf-1',
      definition: { nodes: [], edges: [] },
      isPublished: true,
      city: { allowedDomains: ['example.com'] },
    })
    mockWorkflowController.createExecution.mockResolvedValueOnce({
      id: 'exec-1',
    })
    ;(tasks.trigger as any).mockResolvedValueOnce({ id: 'run-abc123' })
    mockWorkflowController.updateExecution.mockResolvedValueOnce({})

    const res = await app.request('/builder/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId: 'wf-1', checkId: 'check-1' }),
    })

    expect(res.status).toBe(202)
    const body = await res.json()
    expect(body.executionId).toBe('exec-1')
    expect(body.triggerRunId).toBe('run-abc123')

    expect(tasks.trigger).toHaveBeenCalledWith(
      'execute-workflow',
      {
        ir: { entryBlockId: 'start', blocks: {} },
        executionId: 'exec-1',
        callbackUrl: 'http://localhost:8080/webhooks/trigger',
        callbackSecret: 'test-secret',
        allowedDomains: ['example.com'],
      },
      {
        idempotencyKey: 'exec-1',
      }
    )
  })
})
