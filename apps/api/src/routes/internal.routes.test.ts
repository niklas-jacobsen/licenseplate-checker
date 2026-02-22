import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Hono } from 'hono'

mock.module('../env', () => ({
  ENV: { TRIGGER_WEBHOOK_SECRET: 'test-secret' },
}))

import { errorHandler } from '../app'
import { createInternalRouter } from './internal.routes'

const executeWorkflowMock = mock()

const mockCheckController = {
  getById: mock(),
} as any

const mockWorkflowController = {} as any

function makeApp() {
  const app = new Hono()
  app.onError(errorHandler)
  app.route(
    '/internal',
    createInternalRouter(
      mockWorkflowController,
      mockCheckController,
      executeWorkflowMock as any
    )
  )
  return app
}

function post(app: Hono, checkId: string, secret?: string) {
  return app.request(`/internal/execute-check/${checkId}`, {
    method: 'POST',
    headers: secret ? { 'X-Internal-Secret': secret } : {},
  })
}

describe('POST /internal/execute-check/:checkId', () => {
  beforeEach(() => {
    mockCheckController.getById.mockReset()
    executeWorkflowMock.mockReset()
  })

  it('returns 401 when secret header is missing', async () => {
    const app = makeApp()
    const res = await post(app, 'check-1')
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.message).toBe('Unauthorized')
  })

  it('returns 401 when secret header is wrong', async () => {
    const app = makeApp()
    const res = await post(app, 'check-1', 'wrong-secret')
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.message).toBe('Unauthorized')
  })

  it('returns 400 when check is not found', async () => {
    const app = makeApp()
    mockCheckController.getById.mockResolvedValue(null)

    const res = await post(app, 'check-1', 'test-secret')
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.code).toBe('CHECK_NOT_FOUND')
  })

  it('returns 400 when check has no linked workflow', async () => {
    const app = makeApp()
    mockCheckController.getById.mockResolvedValue({
      id: 'check-1',
      workflowId: null,
    })

    const res = await post(app, 'check-1', 'test-secret')
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.code).toBe('MISSING_WORKFLOW')
  })

  it('executes workflow and returns 202 on success', async () => {
    const app = makeApp()
    mockCheckController.getById.mockResolvedValue({
      id: 'check-1',
      workflowId: 'wf-1',
    })
    executeWorkflowMock.mockResolvedValue({
      executionId: 'exec-1',
      status: 'RUNNING',
    })

    const res = await post(app, 'check-1', 'test-secret')
    expect(res.status).toBe(202)
    const body = await res.json()
    expect(body.executionId).toBe('exec-1')
    expect(executeWorkflowMock).toHaveBeenCalledWith(
      mockWorkflowController,
      'wf-1',
      'check-1'
    )
  })
})
