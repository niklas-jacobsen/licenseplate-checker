import { Hono } from 'hono'
import {
  BUILDER_REGISTRY_VERSION,
  nodeRegistry,
} from '@licenseplate-checker/shared/node-registry'
import { BUILDER_MAX_WORKFLOWS_PER_USER } from '@licenseplate-checker/shared/constants/limits'
import { validateGraph } from '../builder/validate/validateGraph'
import { compileGraphToIr } from '../builder/compiler/GraphToIrCompiler'
import { CompileError } from '../types/compiler.types'
import {
  BadRequestError,
  InternalServerError,
} from '@licenseplate-checker/shared/types'
import WorkflowController from '../controllers/Workflow.controller'
import { executeWorkflowForCheck } from '../services/executeWorkflowForCheck'
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
      throw new BadRequestError(
        'Request body must be valid JSON',
        'INVALID_JSON'
      )
    }

    const result = validateGraph(body)

    if (!result.ok) {
      throw new BadRequestError('Graph validation failed', 'VALIDATION_ERROR', {
        issues: result.issues,
      })
    }

    return c.json({
      ok: true,
      issues: result.issues,
    })
  })

  router.post('/compile', auth, async (c) => {
    let body: unknown

    try {
      body = await c.req.json()
    } catch {
      throw new BadRequestError(
        'Request body must be valid JSON',
        'INVALID_JSON'
      )
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

  router.post('/execute', auth, async (c) => {
    let body: unknown

    try {
      body = await c.req.json()
    } catch {
      throw new BadRequestError(
        'Request body must be valid JSON',
        'INVALID_JSON'
      )
    }

    const { workflowId, checkId } = body as {
      workflowId: string
      checkId?: string
    }

    if (!workflowId) {
      throw new BadRequestError('workflowId is required', 'MISSING_WORKFLOW_ID')
    }

    const result = await executeWorkflowForCheck(
      workflowController,
      workflowId,
      checkId
    )

    return c.json(result, 202)
  })

  router.get('/workflows', async (c) => {
    const cityId = c.req.query('cityId')
    if (!cityId) {
      throw new BadRequestError(
        'cityId query parameter is required',
        'MISSING_CITY_ID'
      )
    }

    const workflows = await workflowController.getPublishedByCity(cityId)
    return c.json({ workflows })
  })

  router.get('/my-workflows', auth, async (c) => {
    const user = c.get('user' as any) as { id: string }
    const workflows = await workflowController.getByAuthor(user.id)
    return c.json({ workflows })
  })

  router.post('/workflow', auth, async (c) => {
    const user = c.get('user' as any) as { id: string }
    let body: {
      name: string
      cityId: string
      definition: unknown
      description?: string
    }

    try {
      body = await c.req.json()
    } catch {
      throw new BadRequestError(
        'Request body must be valid JSON',
        'INVALID_JSON'
      )
    }

    if (!body.name || !body.cityId || !body.definition) {
      throw new BadRequestError(
        'name, cityId, and definition are required',
        'MISSING_FIELDS'
      )
    }

    const existingCount = await workflowController.countByAuthor(user.id)
    if (existingCount >= BUILDER_MAX_WORKFLOWS_PER_USER) {
      throw new BadRequestError(
        `Maximum of ${BUILDER_MAX_WORKFLOWS_PER_USER} workflows per user reached`,
        'WORKFLOW_LIMIT_REACHED'
      )
    }

    const workflow = await workflowController.create(
      body.name,
      body.cityId,
      user.id,
      body.definition,
      body.description
    )

    const validation = validateGraph(body.definition)

    return c.json(
      {
        workflow,
        validation: { ok: validation.ok, issues: validation.issues },
      },
      201
    )
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
      throw new BadRequestError(
        'Request body must be valid JSON',
        'INVALID_JSON'
      )
    }

    if (!body.definition) {
      throw new BadRequestError('definition is required', 'MISSING_DEFINITION')
    }

    const existing = await workflowController.getById(id)
    if (!existing) {
      throw new BadRequestError('Workflow not found', 'WORKFLOW_NOT_FOUND')
    }

    const workflow = await workflowController.updateDefinition(
      id,
      body.definition
    )

    const validation = validateGraph(body.definition)

    return c.json({
      workflow,
      validation: { ok: validation.ok, issues: validation.issues },
    })
  })

  router.put('/workflow/:id/publish', auth, async (c) => {
    const id = c.req.param('id')
    let body: { isPublished: boolean }

    try {
      body = await c.req.json()
    } catch {
      throw new BadRequestError(
        'Request body must be valid JSON',
        'INVALID_JSON'
      )
    }

    if (typeof body.isPublished !== 'boolean') {
      throw new BadRequestError(
        'isPublished (boolean) is required',
        'MISSING_IS_PUBLISHED'
      )
    }

    const existing = await workflowController.getById(id)
    if (!existing) {
      throw new BadRequestError('Workflow not found', 'WORKFLOW_NOT_FOUND')
    }

    if (body.isPublished) {
      const validation = validateGraph(existing.definition)
      if (!validation.ok) {
        throw new BadRequestError(
          'Cannot publish: workflow definition is invalid',
          'VALIDATION_ERROR',
          { issues: validation.issues }
        )
      }

      try {
        compileGraphToIr(existing.definition)
      } catch (err) {
        if (err instanceof CompileError) {
          throw new BadRequestError(
            'Cannot publish: workflow definition does not compile',
            'COMPILE_ERROR',
            { issues: err.issues }
          )
        }
        throw err
      }
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
