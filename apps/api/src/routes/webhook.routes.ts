import { Hono } from 'hono'
import WorkflowController from '../controllers/Workflow.controller'
import LicenseplateCheckController from '../controllers/LicensePlateCheck.controller'
import { ENV } from '../env'
import type { ExecutionStatus } from '@prisma/client'

interface ExecutionCallbackBody {
  executionId: string
  status: 'SUCCESS' | 'FAILED'
  logs: unknown[]
  error?: string
  errorNodeId?: string
  duration: number
}

export const createWebhookRouter = (
  workflowController: WorkflowController,
  checkController: LicenseplateCheckController,
) => {
  const router = new Hono()

  router.post('/trigger', async (c) => {
    const secret = c.req.header('X-Webhook-Secret')

    if (!secret || secret !== ENV.TRIGGER_WEBHOOK_SECRET) {
      return c.json({ message: 'Unauthorized' }, 401)
    }

    const body = await c.req.json<ExecutionCallbackBody>()

    const execution = await workflowController.getExecution(body.executionId)

    if (!execution) {
      return c.json({ message: 'Execution not found' }, 404)
    }

    await workflowController.updateExecution(body.executionId, {
      status: body.status as ExecutionStatus,
      logs: body.logs as any,
      result: body.error ? { error: body.error } : { success: true },
      errorNodeId: body.errorNodeId,
      duration: body.duration,
      finishedAt: new Date(),
    })

    if (execution.checkId) {
      const checkStatus = body.status === 'SUCCESS' ? 'AVAILABLE' : 'ERROR_DURING_CHECK'
      await checkController.updateStatus(execution.checkId, checkStatus)
    }

    return c.json({ received: true }, 200)
  })

  return router
}

export const webhookRouter = createWebhookRouter(
  new WorkflowController(),
  new LicenseplateCheckController(),
)
