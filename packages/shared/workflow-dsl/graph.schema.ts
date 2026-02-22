import { z } from 'zod'
import {
  ClickNodeConfig,
  ConditionalNodeConfig,
  EndNodeConfig,
  OpenPageNodeConfig,
  SelectOptionNodeConfig,
  StartNodeConfig,
  TypeTextNodeConfig,
  WaitNodeConfig,
} from './config'

//Core Identifiers & Position
export const RegistryVersionSchema = z.string().min(1)
export const NodeIdSchema = z.string().min(1)
export const EdgeIdSchema = z.string().min(1)
export const HandleIdSchema = z.string().min(1)

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
})

//Base node props
const BaseNodeSchema = z.object({
  id: NodeIdSchema,
  position: PositionSchema,

  width: z.number().optional(),
  height: z.number().optional(),

  hidden: z.boolean().optional(),
  selected: z.boolean().optional(),
  dragging: z.boolean().optional(),
})

//Specific Node Schemas

const StartNodeSchema = BaseNodeSchema.extend({
  type: z.literal('core.start'),
  data: z.object({ label: z.string(), config: StartNodeConfig }),
})

const EndNodeSchema = BaseNodeSchema.extend({
  type: z.literal('core.end'),
  data: z.object({ label: z.string(), config: EndNodeConfig }),
})

const ClickNodeSchema = BaseNodeSchema.extend({
  type: z.literal('core.click'),
  data: z.object({ label: z.string(), config: ClickNodeConfig }),
})

const TypeTextNodeSchema = BaseNodeSchema.extend({
  type: z.literal('core.typeText'),
  data: z.object({ label: z.string(), config: TypeTextNodeConfig }),
})

const OpenPageNodeSchema = BaseNodeSchema.extend({
  type: z.literal('core.openPage'),
  data: z.object({ label: z.string(), config: OpenPageNodeConfig }),
})

const ConditionalNodeSchema = BaseNodeSchema.extend({
  type: z.literal('core.conditional'),
  data: z.object({ label: z.string(), config: ConditionalNodeConfig }),
})

const WaitNodeSchema = BaseNodeSchema.extend({
  type: z.literal('core.wait'),
  data: z.object({ label: z.string(), config: WaitNodeConfig }),
})

const SelectOptionNodeSchema = BaseNodeSchema.extend({
  type: z.literal('core.selectOption'),
  data: z.object({ label: z.string(), config: SelectOptionNodeConfig }),
})

//Union of node specific types
export const ReactFlowNodeSchema = z.discriminatedUnion('type', [
  StartNodeSchema,
  EndNodeSchema,
  ClickNodeSchema,
  TypeTextNodeSchema,
  OpenPageNodeSchema,
  ConditionalNodeSchema,
  WaitNodeSchema,
  SelectOptionNodeSchema,
])

export const CoreNodeTypeSchema = z.enum([
  'core.start',
  'core.end',
  'core.click',
  'core.typeText',
  'core.openPage',
  'core.conditional',
  'core.wait',
  'core.selectOption',
])

//Edges & Graph
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

export const WorkflowGraphSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().optional(),
  registryVersion: RegistryVersionSchema,
  nodes: z.array(ReactFlowNodeSchema),
  edges: z.array(ReactFlowEdgeSchema),
  meta: z.record(z.string(), z.unknown()).optional(),
})
