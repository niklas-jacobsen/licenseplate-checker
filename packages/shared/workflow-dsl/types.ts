import type { z } from 'zod'
import type {
  WorkflowGraphSchema,
  ReactFlowNodeSchema,
  ReactFlowEdgeSchema,
  RegistryVersionSchema,
  NodeIdSchema,
  EdgeIdSchema,
  HandleIdSchema,
  CoreNodeTypeSchema,
} from './graph.schema'

export type RegistryVersion = z.infer<typeof RegistryVersionSchema>

export type NodeId = z.infer<typeof NodeIdSchema>
export type EdgeId = z.infer<typeof EdgeIdSchema>
export type HandleId = z.infer<typeof HandleIdSchema>

export type CoreNodeType = z.infer<typeof CoreNodeTypeSchema>

export type WorkflowNode = z.infer<typeof ReactFlowNodeSchema>
export type WorkflowEdge = z.infer<typeof ReactFlowEdgeSchema>
export type WorkflowGraph = z.infer<typeof WorkflowGraphSchema>
