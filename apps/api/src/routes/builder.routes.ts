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
    return c.json(
      {
        ok: false,
        issues: [
          {
            type: 'graph.parse',
            message: 'Request body must be valid JSON.',
          },
        ],
      },
      400
    )
  }

  const result = validateGraph(body)

  if (!result.ok) {
    return c.json(
      {
        ok: false,
        issues: result.issues,
      },
      400
    )
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
    return c.json(
      {
        ok: false,
        issues: [
          { type: 'graph.parse', message: 'Request body must be valid JSON.' },
        ],
      },
      400
    )
  }

  try {
    const ir = compileGraphToIr(body)
    return c.json({ ok: true, ir })
  } catch (err) {
    if (err instanceof CompileError) {
      return c.json({ ok: false, issues: err.issues }, 400)
    }

    return c.json({ ok: false, message: 'Unexpected compile error.' }, 500)
  }
})

builderRouter.post('/execute', async (c) => {
  let body: unknown

  try {
    body = await c.req.json()
  } catch {
    return c.json(
      {
        ok: false,
        message: 'Request body must be valid JSON.',
      },
      400
    )
  }

  //need to replace BuilderIR assumption with actual validation
  const ir = body as any 

  try {
    const executor = new IrExecutor()
    const result = await executor.execute(ir)
    return c.json(result)
  } catch (err) {
    return c.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      },
      500
    )
  }
})
