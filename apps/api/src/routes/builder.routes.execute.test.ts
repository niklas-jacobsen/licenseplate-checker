import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Hono } from 'hono'

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

import { BadRequestError } from '@licenseplate-checker/shared/types'
import { errorHandler } from '../app'
import { createBuilderRouter } from './builder.routes'

const executeWorkflowMock = mock()

const mockWorkflowController = {
  getById: mock(),
} as any

function makeApp() {
  const app = new Hono()
  app.onError(errorHandler)
  app.route(
    '/builder',
    createBuilderRouter(
      mockWorkflowController,
      undefined,
      undefined,
      executeWorkflowMock as any
    )
  )
  return app
}

describe('POST /builder/execute', () => {
  beforeEach(() => {
    mockWorkflowController.getById.mockReset()
    executeWorkflowMock.mockReset()
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

  it('returns 404 when workflow not found', async () => {
    const app = makeApp()
    mockWorkflowController.getById.mockResolvedValueOnce(null)

    const res = await app.request('/builder/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId: 'nonexistent' }),
    })
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error.code).toBe('WORKFLOW_NOT_FOUND')
  })

  it('returns 400 when executeWorkflowForCheck throws', async () => {
    const app = makeApp()
    mockWorkflowController.getById.mockResolvedValueOnce({
      id: 'wf-1',
      authorId: 'test-user-id',
    })
    executeWorkflowMock.mockRejectedValueOnce(
      new BadRequestError('Workflow is not published', 'WORKFLOW_NOT_PUBLISHED')
    )

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
      authorId: 'test-user-id',
    })
    executeWorkflowMock.mockResolvedValueOnce({
      executionId: 'exec-1',
      triggerRunId: 'run-abc123',
    })

    const res = await app.request('/builder/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId: 'wf-1', checkId: 'check-1' }),
    })

    expect(res.status).toBe(202)
    const body = await res.json()
    expect(body.executionId).toBe('exec-1')
    expect(body.triggerRunId).toBe('run-abc123')

    expect(executeWorkflowMock).toHaveBeenCalledWith(
      mockWorkflowController,
      'wf-1',
      'check-1',
      expect.objectContaining({})
    )
  })
})
