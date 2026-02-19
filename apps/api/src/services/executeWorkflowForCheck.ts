import { compileGraphToIr } from '../builder/compiler/GraphToIrCompiler'
import { CompileError } from '../types/compiler.types'
import { AppError, BadRequestError, InternalServerError } from '@licenseplate-checker/shared/types'
import { tasks } from '@trigger.dev/sdk/v3'
import type { executeWorkflow } from '../trigger/executeWorkflow'
import WorkflowController from '../controllers/Workflow.controller'
import { ENV } from '../env'

// shared logic for both workflow compilation and trigger.dev execution
export async function executeWorkflowForCheck(
  workflowController: WorkflowController,
  workflowId: string,
  checkId?: string,
  options?: { skipPublishCheck?: boolean },
) {
  const workflow = await workflowController.getById(workflowId)

  if (!workflow) {
    throw new BadRequestError('Workflow not found', 'WORKFLOW_NOT_FOUND')
  }

  if (!options?.skipPublishCheck && !workflow.isPublished) {
    throw new BadRequestError('Workflow is not published', 'WORKFLOW_NOT_PUBLISHED')
  }

  try {
    const ir = compileGraphToIr(workflow.definition)

    const execution = await workflowController.createExecution(workflowId, checkId)

    const handle = await tasks.trigger<typeof executeWorkflow>("execute-workflow", {
      ir,
      executionId: execution.id,
      callbackUrl: `${ENV.API_BASE_URL}/webhooks/trigger`,
      callbackSecret: ENV.TRIGGER_WEBHOOK_SECRET,
      allowedDomains: workflow.city.allowedDomains,
    }, {
      idempotencyKey: execution.id,
    })

    await workflowController.updateExecution(execution.id, {
      triggerRunId: handle.id,
      status: 'RUNNING',
    })

    return {
      executionId: execution.id,
      triggerRunId: handle.id,
    }
  } catch (err) {
    if (err instanceof CompileError) {
      throw err
    }
    if (err instanceof AppError) {
      throw err
    }
    throw new InternalServerError(
      err instanceof Error ? err.message : String(err),
      'EXECUTION_TRIGGER_ERROR'
    )
  }
}
