import { BadRequestError } from '@licenseplate-checker/shared/types'
import { Hono } from 'hono'
import LicenseplateCheckController from '../controllers/LicensePlateCheck.controller'
import WorkflowController from '../controllers/Workflow.controller'
import { ENV } from '../env'
import { executeWorkflowForCheck as defaultExecuteWorkflowForCheck } from '../services/executeWorkflowForCheck'

export const createInternalRouter = (
  workflowController: WorkflowController,
  checkController: LicenseplateCheckController,
  executeWorkflowForCheck = defaultExecuteWorkflowForCheck
) => {
  const router = new Hono()

  router.post('/execute-check/:checkId', async (c) => {
    const secret = c.req.header('X-Internal-Secret')

    if (!secret || secret !== ENV.TRIGGER_WEBHOOK_SECRET) {
      return c.json({ message: 'Unauthorized' }, 401)
    }

    const checkId = c.req.param('checkId')
    const check = await checkController.getById(checkId)

    if (!check) {
      throw new BadRequestError('Check not found', 'CHECK_NOT_FOUND')
    }

    if (!check.workflowId) {
      throw new BadRequestError(
        'Check has no linked workflow',
        'MISSING_WORKFLOW'
      )
    }

    const result = await executeWorkflowForCheck(
      workflowController,
      check.workflowId,
      checkId
    )

    return c.json(result, 202)
  })

  return router
}

export const internalRouter = createInternalRouter(
  new WorkflowController(),
  new LicenseplateCheckController()
)
