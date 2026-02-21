import { Hono } from 'hono'
import WorkflowController from '../controllers/Workflow.controller'
import LicenseplateCheckController from '../controllers/LicensePlateCheck.controller'
import { ENV } from '../env'
import type { ExecutionStatus, Prisma } from '@prisma/client'

interface CompletionCallbackBody {
  type: 'completion'
  executionId: string
  status: 'SUCCESS' | 'FAILED'
  logs: unknown[]
  error?: string
  errorNodeId?: string
  outcome?: string
  duration: number
}

interface ProgressCallbackBody {
  type: 'progress'
  executionId: string
  currentNodeId: string | null
  completedNodes: { nodeId: string; status: 'success' | 'error' }[]
}

type CallbackBody = CompletionCallbackBody | ProgressCallbackBody

export const createWebhookRouter = (
  workflowController: WorkflowController,
  checkController: LicenseplateCheckController
) => {
  const router = new Hono()

  router.post('/trigger', async (c) => {
    const secret = c.req.header('X-Webhook-Secret')

    if (!secret || secret !== ENV.TRIGGER_WEBHOOK_SECRET) {
      return c.json({ message: 'Unauthorized' }, 401)
    }

    const body = await c.req.json<CallbackBody>()

    if (body.type === 'progress') {
      await workflowController.updateExecution(body.executionId, {
        status: 'RUNNING',
        currentNodeId: body.currentNodeId,
        completedNodes: body.completedNodes as Prisma.InputJsonValue,
      })

      return c.json({ received: true }, 200)
    }

    // completion
    const execution = await workflowController.getExecution(body.executionId)

    if (!execution) {
      return c.json({ message: 'Execution not found' }, 404)
    }

    await workflowController.updateExecution(body.executionId, {
      status: body.status as ExecutionStatus,
      // biome-ignore lint/suspicious/noExplicitAny:
      logs: body.logs as any,
      result: body.error ? { error: body.error } : { success: true },
      errorNodeId: body.errorNodeId,
      duration: body.duration,
      finishedAt: new Date(),
      currentNodeId: null,
    })

    if (execution.checkId) {
      let checkStatus: 'AVAILABLE' | 'NOT_AVAILABLE' | 'ERROR_DURING_CHECK'
      if (body.status !== 'SUCCESS') {
        checkStatus = 'ERROR_DURING_CHECK'
      } else if (body.outcome === 'unavailable') {
        checkStatus = 'NOT_AVAILABLE'
      } else {
        checkStatus = 'AVAILABLE'
      }
      await checkController.updateStatus(execution.checkId, checkStatus)
    }

    return c.json({ received: true }, 200)
  })

  return router
}

export const webhookRouter = createWebhookRouter(
  new WorkflowController(),
  new LicenseplateCheckController()
)
