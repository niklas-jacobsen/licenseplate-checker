import {
  BUILDER_MAX_NODES_PER_GRAPH,
  BUILDER_MAX_WORKFLOWS_PER_USER,
  BUILDER_TEST_EXECUTIONS_PER_DAY,
} from '@licenseplate-checker/shared/constants/limits'
import {
  BUILDER_REGISTRY_VERSION,
  nodeRegistry,
} from '@licenseplate-checker/shared/node-registry'
import type { VariableContext } from '@licenseplate-checker/shared/template-variables'
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from '@licenseplate-checker/shared/types'
import {
  zWorkflowDescriptionSchema,
  zWorkflowNameSchema,
} from '@licenseplate-checker/shared/validators'
import { Prisma } from '@prisma/client'
import { Hono } from 'hono'
import { prisma } from '../../prisma/data-source'
import { compileGraphToIr as defaultCompileGraphToIr } from '../builder/compiler/GraphToIrCompiler'
import { validateGraph as defaultValidateGraph } from '../builder/validate/validateGraph'
import WorkflowController from '../controllers/Workflow.controller'
import auth from '../middleware/auth'
import {
  buildVariableContext,
  executeWorkflowForCheck as defaultExecuteWorkflowForCheck,
} from '../services/executeWorkflowForCheck'
import { CompileError } from '../types/compiler.types'
import type { ValidationIssue } from '../types/validate.types'

export const createBuilderRouter = (
  workflowController: WorkflowController,
  validateGraph = defaultValidateGraph,
  compileGraphToIr = defaultCompileGraphToIr,
  executeWorkflowForCheck = defaultExecuteWorkflowForCheck
) => {
  const router = new Hono()

  async function getOwnedWorkflow(id: string, userId: string) {
    const workflow = await workflowController.getById(id)
    if (!workflow || workflow.authorId !== userId) {
      throw new NotFoundError('Workflow not found', 'WORKFLOW_NOT_FOUND')
    }
    return workflow
  }

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
    // biome-ignore lint/suspicious/noExplicitAny:
    const user = c.get('user' as any) as { id: string }
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

    await getOwnedWorkflow(workflowId, user.id)

    let variables: VariableContext | undefined
    if (checkId) {
      const check = await prisma.licenseplateCheck.findUnique({
        where: { id: checkId },
        select: { cityId: true, letters: true, numbers: true },
      })
      if (check) {
        variables = buildVariableContext(check)
      }
    }

    const result = await executeWorkflowForCheck(
      workflowController,
      workflowId,
      checkId,
      { variables }
    )

    return c.json(result, 202)
  })

  router.post('/test-execute', auth, async (c) => {
    let body: unknown

    try {
      body = await c.req.json()
    } catch {
      throw new BadRequestError(
        'Request body must be valid JSON',
        'INVALID_JSON'
      )
    }

    const { workflowId, variables } = body as {
      workflowId: string
      variables?: VariableContext
    }

    if (!workflowId) {
      throw new BadRequestError('workflowId is required', 'MISSING_WORKFLOW_ID')
    }

    // validate graph before execution
    // biome-ignore lint/suspicious/noExplicitAny:
    const user = c.get('user' as any) as { id: string }
    const workflow = await getOwnedWorkflow(workflowId, user.id)

    const validation = validateGraph(workflow.definition)
    if (!validation.ok) {
      throw new BadRequestError(
        'Workflow definition is invalid',
        'VALIDATION_ERROR',
        { issues: validation.issues }
      )
    }

    if (validation.issues.length > 0) {
      throw new BadRequestError(
        validation.issues[0].message,
        'VALIDATION_ERROR',
        { issues: validation.issues }
      )
    }

    // compile to catch dead ends, missing connections, etc.
    try {
      compileGraphToIr(workflow.definition)
    } catch (err) {
      if (err instanceof CompileError) {
        throw new BadRequestError(
          'Workflow does not compile: ' + err.message,
          'COMPILE_ERROR',
          { issues: err.issues }
        )
      }
      throw err
    }

    // daily limit for test executions so this feature is not abused
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentCount = await workflowController.countRecentExecutions(
      workflowId,
      oneDayAgo
    )
    if (recentCount >= BUILDER_TEST_EXECUTIONS_PER_DAY) {
      throw new BadRequestError(
        `Test limit reached (${BUILDER_TEST_EXECUTIONS_PER_DAY} per day). Try again later.`,
        'TEST_LIMIT_REACHED'
      )
    }

    const result = await executeWorkflowForCheck(
      workflowController,
      workflowId,
      undefined,
      { skipPublishCheck: true, variables }
    )

    return c.json(
      {
        ...result,
        testsRemaining: BUILDER_TEST_EXECUTIONS_PER_DAY - recentCount - 1,
      },
      202
    )
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
    // biome-ignore lint/suspicious/noExplicitAny:
    const user = c.get('user' as any) as { id: string }
    const workflows = await workflowController.getByAuthor(user.id)
    return c.json({ workflows })
  })

  router.post('/workflow', auth, async (c) => {
    // biome-ignore lint/suspicious/noExplicitAny:
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

    const nameResult = zWorkflowNameSchema.safeParse(body.name)
    if (!nameResult.success) {
      throw new BadRequestError(
        nameResult.error.issues[0].message,
        'INVALID_NAME'
      )
    }

    if (body.description !== undefined) {
      const descResult = zWorkflowDescriptionSchema.safeParse(body.description)
      if (!descResult.success) {
        throw new BadRequestError(
          descResult.error.issues[0].message,
          'INVALID_DESCRIPTION'
        )
      }
    }

    const defNodes = (body.definition as { nodes?: unknown[] })?.nodes
    if (Array.isArray(defNodes) && defNodes.length > BUILDER_MAX_NODES_PER_GRAPH) {
      throw new BadRequestError(
        `Graph exceeds maximum of ${BUILDER_MAX_NODES_PER_GRAPH} nodes`,
        'NODE_LIMIT_EXCEEDED'
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

  router.get('/workflow/:id', auth, async (c) => {
    // biome-ignore lint/suspicious/noExplicitAny:
    const user = c.get('user' as any) as { id: string }
    const id = c.req.param('id')
    const workflow = await getOwnedWorkflow(id, user.id)

    return c.json({ workflow })
  })

  router.put('/workflow/:id', auth, async (c) => {
    // biome-ignore lint/suspicious/noExplicitAny:
    const user = c.get('user' as any) as { id: string }
    const id = c.req.param('id')
    let body: {
      definition?: unknown
      name?: string
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

    const existing = await getOwnedWorkflow(id, user.id)

    if (body.name !== undefined) {
      const nameResult = zWorkflowNameSchema.safeParse(body.name)
      if (!nameResult.success) {
        throw new BadRequestError(
          nameResult.error.issues[0].message,
          'INVALID_NAME'
        )
      }
    }

    if (body.description !== undefined) {
      const descResult = zWorkflowDescriptionSchema.safeParse(body.description)
      if (!descResult.success) {
        throw new BadRequestError(
          descResult.error.issues[0].message,
          'INVALID_DESCRIPTION'
        )
      }
    }

    if (body.definition) {
      const defNodes = (body.definition as { nodes?: unknown[] })?.nodes
      if (Array.isArray(defNodes) && defNodes.length > BUILDER_MAX_NODES_PER_GRAPH) {
        throw new BadRequestError(
          `Graph exceeds maximum of ${BUILDER_MAX_NODES_PER_GRAPH} nodes`,
          'NODE_LIMIT_EXCEEDED'
        )
      }
    }

    let validation: { ok: boolean; issues: ValidationIssue[] } = {
      ok: true,
      issues: [],
    }

    if (body.definition) {
      const result = validateGraph(body.definition)
      if (!result.ok) {
        validation = { ok: false, issues: result.issues }
      }
    }

    let workflow
    try {
      const updateName =
        body.name !== undefined && body.name !== existing.name
          ? body.name
          : undefined

      workflow = await workflowController.update(id, {
        name: updateName,
        description: body.description,
        definition: body.definition as Prisma.InputJsonValue,
      })
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictError(
          'A workflow with this name already exists for this city',
          'DUPLICATE_WORKFLOW_NAME'
        )
      }
      throw err
    }

    return c.json({
      workflow,
      validation,
    })
  })

  router.put('/workflow/:id/publish', auth, async (c) => {
    // biome-ignore lint/suspicious/noExplicitAny:
    const user = c.get('user' as any) as { id: string }
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

    const existing = await getOwnedWorkflow(id, user.id)

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
    // biome-ignore lint/suspicious/noExplicitAny:
    const user = c.get('user' as any) as { id: string }
    const id = c.req.param('id')

    await getOwnedWorkflow(id, user.id)
    await workflowController.delete(id)
    return c.json({ message: 'Workflow deleted' })
  })

  router.get('/execution/:id', auth, async (c) => {
    // biome-ignore lint/suspicious/noExplicitAny:
    const user = c.get('user' as any) as { id: string }
    const id = c.req.param('id')
    const execution = await workflowController.getExecution(id)

    if (!execution || execution.workflow.authorId !== user.id) {
      throw new NotFoundError('Execution not found', 'EXECUTION_NOT_FOUND')
    }

    return c.json({ execution })
  })

  return router
}

export const builderRouter = createBuilderRouter(new WorkflowController())
