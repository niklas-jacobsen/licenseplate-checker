import { Hono } from 'hono'
import {
  BUILDER_REGISTRY_VERSION,
  nodeRegistry,
} from '../../../../packages/shared/node-registry'
import { validateGraph } from '../builder/validate/validateGraph'
import {
  compileGraphToIr,
} from '../builder/compiler/GraphToIrCompiler'
import { CompileError } from '../types/compiler.types'
import { IrExecutor } from '../builder/execution/IrExecutor'
import { AppError, BadRequestError, InternalServerError } from '../types/error.types'

export const builderRouter = new Hono()

builderRouter.get('/registry', (c) =>
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

builderRouter.post('/validate', async (c) => {
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

builderRouter.post('/compile', async (c) => {
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

builderRouter.post('/execute', async (c) => {
  let body: unknown

  try {
    body = await c.req.json()
  } catch {
    throw new BadRequestError('Request body must be valid JSON', 'INVALID_JSON')
  }

  //need to replace BuilderIR assumption with actual validation
  const ir = body as any 

  try {
    const executor = new IrExecutor()
    const result = await executor.execute(ir)
    return c.json(result)
  } catch (err) {
    if (err instanceof AppError) {
      throw err
    }
    throw new InternalServerError(err instanceof Error ? err.message : String(err))
  }
})
