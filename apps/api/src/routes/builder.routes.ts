import { Hono, Context } from 'hono'
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
import auth from '../middleware/auth'

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

  router.get('/workflows', async (c) => {
    const cityId = c.req.query('cityId')
    if (!cityId) {
      throw new BadRequestError('cityId query parameter is required', 'MISSING_CITY_ID')
    }

    const workflows = await workflowController.getPublishedByCity(cityId)
    return c.json({ workflows })
  })

  router.post('/workflow', auth, async (c) => {
    const user = c.get('user' as any) as { id: string }
    let body: { name: string; cityId: string; definition: unknown; description?: string }

    try {
      body = await c.req.json()
    } catch {
      throw new BadRequestError('Request body must be valid JSON', 'INVALID_JSON')
    }

    if (!body.name || !body.cityId || !body.definition) {
      throw new BadRequestError('name, cityId, and definition are required', 'MISSING_FIELDS')
    }

    const workflow = await workflowController.create(
      body.name,
      body.cityId,
      user.id,
      body.definition,
      body.description,
    )

    return c.json({ workflow }, 201)
  })

  router.get('/workflow/:id', async (c) => {
    const id = c.req.param('id')
    const workflow = await workflowController.getById(id)

    if (!workflow) {
      throw new BadRequestError('Workflow not found', 'WORKFLOW_NOT_FOUND')
    }

    return c.json({ workflow })
  })

  router.put('/workflow/:id', auth, async (c) => {
    const id = c.req.param('id')
    let body: { definition: unknown }

    try {
      body = await c.req.json()
    } catch {
      throw new BadRequestError('Request body must be valid JSON', 'INVALID_JSON')
    }

    if (!body.definition) {
      throw new BadRequestError('definition is required', 'MISSING_DEFINITION')
    }

    const existing = await workflowController.getById(id)
    if (!existing) {
      throw new BadRequestError('Workflow not found', 'WORKFLOW_NOT_FOUND')
    }

    const workflow = await workflowController.updateDefinition(id, body.definition)
    return c.json({ workflow })
  })

  router.put('/workflow/:id/publish', auth, async (c) => {
    const id = c.req.param('id')
    let body: { isPublished: boolean }

    try {
      body = await c.req.json()
    } catch {
      throw new BadRequestError('Request body must be valid JSON', 'INVALID_JSON')
    }

    if (typeof body.isPublished !== 'boolean') {
      throw new BadRequestError('isPublished (boolean) is required', 'MISSING_IS_PUBLISHED')
    }

    const existing = await workflowController.getById(id)
    if (!existing) {
      throw new BadRequestError('Workflow not found', 'WORKFLOW_NOT_FOUND')
    }

    const workflow = await workflowController.publish(id, body.isPublished)
    return c.json({ workflow })
  })

  router.delete('/workflow/:id', auth, async (c) => {
    const id = c.req.param('id')

    const existing = await workflowController.getById(id)
    if (!existing) {
      throw new BadRequestError('Workflow not found', 'WORKFLOW_NOT_FOUND')
    }

    await workflowController.delete(id)
    return c.json({ message: 'Workflow deleted' })
  })

  router.get('/execution/:id', async (c) => {
    const id = c.req.param('id')
    const execution = await workflowController.getExecution(id)

    if (!execution) {
      throw new BadRequestError('Execution not found', 'EXECUTION_NOT_FOUND')
    }

    return c.json({ execution })
  })

  return router
}

export const builderRouter = createBuilderRouter(new WorkflowController())
