import { Hono } from 'hono'
import { BUILDER_REGISTRY_VERSION, nodeRegistry } from '../builder/registry'
import { validateGraph } from '../builder/validate/validateGraph'

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
