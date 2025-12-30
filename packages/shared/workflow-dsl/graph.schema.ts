import { z } from 'zod'

/* ----------------------------------
   Core identifiers
----------------------------------- */

export const RegistryVersionSchema = z.string().min(1)

export const NodeIdSchema = z.string().min(1)
export const EdgeIdSchema = z.string().min(1)
export const HandleIdSchema = z.string().min(1)

/* ----------------------------------
   Position
----------------------------------- */

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
})

/* ----------------------------------
   Node types
----------------------------------- */

export const CoreNodeTypeSchema = z.enum([
  'core.start',
  'core.end',
  'core.openPage',
  'core.click',
  'core.typeText',
  'core.conditional',
])

/* ----------------------------------
   Node data
----------------------------------- */

export const NodeDataSchema = z.record(z.string(), z.unknown()).default({})

/* ----------------------------------
   React Flow compatible node
----------------------------------- */

export const ReactFlowNodeSchema = z.object({
  id: NodeIdSchema,
  type: CoreNodeTypeSchema,
  position: PositionSchema,
  data: NodeDataSchema,

  width: z.number().optional(),
  height: z.number().optional(),
  hidden: z.boolean().optional(),
})

/* ----------------------------------
   React Flow compatible edge
----------------------------------- */

export const ReactFlowEdgeSchema = z.object({
  id: EdgeIdSchema,

  source: NodeIdSchema,
  target: NodeIdSchema,

  sourceHandle: HandleIdSchema.optional(),
  targetHandle: HandleIdSchema.optional(),

  type: z.string().optional(),
  label: z.string().optional(),
  animated: z.boolean().optional(),
  hidden: z.boolean().optional(),
})

/* ----------------------------------
   Workflow graph
----------------------------------- */

export const WorkflowGraphSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),

  registryVersion: RegistryVersionSchema,

  nodes: z.array(ReactFlowNodeSchema),
  edges: z.array(ReactFlowEdgeSchema),

  meta: z.record(z.string(), z.unknown()).optional(),
})

/* ----------------------------------
   Helpers
----------------------------------- */

export function parseWorkflowGraph(input: unknown) {
  return WorkflowGraphSchema.parse(input)
}

export function safeParseWorkflowGraph(input: unknown) {
  return WorkflowGraphSchema.safeParse(input)
}
