import { Hono } from 'hono'
import {
  BUILDER_REGISTRY_VERSION,
  nodeRegistry,
} from '@licenseplate-checker/shared/node-registry'
import { validateGraph } from '../builder/validate/validateGraph'
import {
  compileGraphToIr,
} from '../builder/compiler/GraphToIrCompiler'
import { CompileError } from '../types/compiler.types'
import { AppError, BadRequestError, InternalServerError } from '@licenseplate-checker/shared/types'
import { tasks } from '@trigger.dev/sdk/v3'
import type { executeWorkflow } from '../trigger/executeWorkflow'
import WorkflowController from '../controllers/Workflow.controller'
import { ENV } from '../env'

export const createBuilderRouter = (workflowController: WorkflowController) => {
  const router = new Hono()

  router.get('/registry', (c) =>
    c.json({
      version: BUILDER_REGISTRY_VERSION,
      nodes: Object.values(nodeRegistry).map((n) => ({
        type: n.type,
        label: n.label,
        category: n.category,
        inputs: n.inputs,
        outputs: n.outputs,
      })),
    })
  )

  router.post('/validate', async (c) => {
    let body: unknown

    try {
      body = await c.req.json()
    } catch {
      throw new BadRequestError('Request body must be valid JSON', 'INVALID_JSON')
    }

    const result = validateGraph(body)

    if (!result.ok) {
      throw new BadRequestError('Graph validation failed', 'VALIDATION_ERROR', { issues: result.issues })
    }

    return c.json({
      ok: true,
      issues: result.issues,
    })
  })

  router.post('/compile', async (c) => {
    let body: unknown

    try {
      body = await c.req.json()
    } catch {
      throw new BadRequestError('Request body must be valid JSON', 'INVALID_JSON')
    }

    try {
      const ir = compileGraphToIr(body)
      return c.json({ ok: true, ir })
    } catch (err) {
      if (err instanceof CompileError) {
        throw err
      }
      throw new InternalServerError('Unexpected compile error', 'COMPILE_ERROR')
    }
  })

  router.post('/execute', async (c) => {
    let body: unknown

    try {
      body = await c.req.json()
    } catch {
      throw new BadRequestError('Request body must be valid JSON', 'INVALID_JSON')
    }

    const { workflowId, checkId } = body as { workflowId: string; checkId?: string }

    if (!workflowId) {
      throw new BadRequestError('workflowId is required', 'MISSING_WORKFLOW_ID')
    }

    const workflow = await workflowController.getById(workflowId)

    if (!workflow) {
      throw new BadRequestError('Workflow not found', 'WORKFLOW_NOT_FOUND')
    }

    try {
      const ir = compileGraphToIr(workflow.definition)

      const execution = await workflowController.createExecution(workflowId, checkId)

      const handle = await tasks.trigger<typeof executeWorkflow>("execute-workflow", {
        ir,
        executionId: execution.id,
        callbackUrl: `${ENV.API_BASE_URL}/webhooks/trigger`,
        callbackSecret: ENV.TRIGGER_WEBHOOK_SECRET,
      })

      await workflowController.updateExecution(execution.id, {
        triggerRunId: handle.id,
        status: 'RUNNING',
      })

      return c.json({
        executionId: execution.id,
        triggerRunId: handle.id,
      }, 202)
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
  })

  return router
}

export const builderRouter = createBuilderRouter(new WorkflowController())
