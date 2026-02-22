import { describe, expect, it, mock, beforeEach } from 'bun:test'
import { Hono } from 'hono'

mock.module('../env', () => ({
  ENV: { TRIGGER_WEBHOOK_SECRET: 'test-secret' },
}))

import { createWebhookRouter } from './webhook.routes'

const mockWorkflowController = {
  updateExecution: mock(),
  getExecution: mock(),
} as any

const mockCheckController = {
  updateStatus: mock(),
} as any

function makeApp() {
  const app = new Hono()
  app.route('/webhooks', createWebhookRouter(mockWorkflowController, mockCheckController))
  return app
}

function post(app: Hono, body: object, secret?: string) {
  return app.request('/webhooks/trigger', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(secret ? { 'X-Webhook-Secret': secret } : {}),
    },
    body: JSON.stringify(body),
  })
}

describe('POST /webhooks/trigger', () => {
  beforeEach(() => {
    mockWorkflowController.updateExecution.mockReset()
    mockWorkflowController.getExecution.mockReset()
    mockCheckController.updateStatus.mockReset()
  })

  describe('auth', () => {
    it('returns 401 when secret header is missing', async () => {
      const res = await post(makeApp(), { type: 'progress', executionId: 'e1' })
      expect(res.status).toBe(401)
    })

    it('returns 401 when secret is wrong', async () => {
      const res = await post(makeApp(), { type: 'progress', executionId: 'e1' }, 'wrong')
      expect(res.status).toBe(401)
    })
  })

  describe('progress callback', () => {
    it('updates execution with RUNNING status and node info', async () => {
      mockWorkflowController.updateExecution.mockResolvedValue({})
      const completedNodes = [{ nodeId: 'n1', status: 'success' }]

      const res = await post(
        makeApp(),
        {
          type: 'progress',
          executionId: 'exec-1',
          currentNodeId: 'n2',
          completedNodes,
        },
        'test-secret'
      )

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.received).toBe(true)

      expect(mockWorkflowController.updateExecution).toHaveBeenCalledWith('exec-1', {
        status: 'RUNNING',
        currentNodeId: 'n2',
        completedNodes,
      })
      expect(mockCheckController.updateStatus).not.toHaveBeenCalled()
    })
  })

  describe('completion callback', () => {
    it('returns 404 when execution not found', async () => {
      mockWorkflowController.getExecution.mockResolvedValue(null)

      const res = await post(
        makeApp(),
        {
          type: 'completion',
          executionId: 'nonexistent',
          status: 'SUCCESS',
          logs: [],
          duration: 1000,
        },
        'test-secret'
      )

      expect(res.status).toBe(404)
    })

    it('updates execution and sets check status to AVAILABLE on success', async () => {
      mockWorkflowController.getExecution.mockResolvedValue({
        id: 'exec-1',
        checkId: 'check-1',
      })
      mockWorkflowController.updateExecution.mockResolvedValue({})
      mockCheckController.updateStatus.mockResolvedValue({})

      const res = await post(
        makeApp(),
        {
          type: 'completion',
          executionId: 'exec-1',
          status: 'SUCCESS',
          outcome: 'available',
          logs: [{ step: 1 }],
          duration: 5000,
        },
        'test-secret'
      )

      expect(res.status).toBe(200)

      expect(mockWorkflowController.updateExecution).toHaveBeenCalledWith(
        'exec-1',
        expect.objectContaining({
          status: 'SUCCESS',
          logs: [{ step: 1 }],
          result: { success: true, outcome: 'available' },
          duration: 5000,
          currentNodeId: null,
        })
      )

      expect(mockCheckController.updateStatus).toHaveBeenCalledWith('check-1', 'AVAILABLE')
    })

    it('sets check status to NOT_AVAILABLE when outcome is unavailable', async () => {
      mockWorkflowController.getExecution.mockResolvedValue({
        id: 'exec-1',
        checkId: 'check-1',
      })
      mockWorkflowController.updateExecution.mockResolvedValue({})
      mockCheckController.updateStatus.mockResolvedValue({})

      await post(
        makeApp(),
        {
          type: 'completion',
          executionId: 'exec-1',
          status: 'SUCCESS',
          outcome: 'unavailable',
          logs: [],
          duration: 3000,
        },
        'test-secret'
      )

      expect(mockCheckController.updateStatus).toHaveBeenCalledWith('check-1', 'NOT_AVAILABLE')
    })

    it('sets check status to ERROR_DURING_CHECK on failure', async () => {
      mockWorkflowController.getExecution.mockResolvedValue({
        id: 'exec-1',
        checkId: 'check-1',
      })
      mockWorkflowController.updateExecution.mockResolvedValue({})
      mockCheckController.updateStatus.mockResolvedValue({})

      await post(
        makeApp(),
        {
          type: 'completion',
          executionId: 'exec-1',
          status: 'FAILED',
          error: 'Timeout',
          errorNodeId: 'n3',
          logs: [],
          duration: 10000,
        },
        'test-secret'
      )

      expect(mockCheckController.updateStatus).toHaveBeenCalledWith(
        'check-1',
        'ERROR_DURING_CHECK'
      )

      expect(mockWorkflowController.updateExecution).toHaveBeenCalledWith(
        'exec-1',
        expect.objectContaining({
          status: 'FAILED',
          result: { error: 'Timeout', outcome: undefined },
          errorNodeId: 'n3',
        })
      )
    })

    it('does not update check status when execution has no checkId', async () => {
      mockWorkflowController.getExecution.mockResolvedValue({
        id: 'exec-1',
        checkId: null,
      })
      mockWorkflowController.updateExecution.mockResolvedValue({})

      const res = await post(
        makeApp(),
        {
          type: 'completion',
          executionId: 'exec-1',
          status: 'SUCCESS',
          logs: [],
          duration: 2000,
        },
        'test-secret'
      )

      expect(res.status).toBe(200)
      expect(mockCheckController.updateStatus).not.toHaveBeenCalled()
    })
  })
})
