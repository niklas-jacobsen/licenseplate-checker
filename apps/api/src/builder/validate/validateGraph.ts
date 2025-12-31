import type { ZodError } from 'zod'
import { WorkflowGraphSchema } from '@shared/workflow-dsl'
import type {
  WorkflowGraph,
  WorkflowNode,
  WorkflowEdge,
} from '@shared/workflow-dsl'
import { nodeRegistry } from '../registry'

export type ValidationIssueType =
  | 'graph.parse'
  | 'graph.start.count'
  | 'graph.end.count'
  | 'graph.unreachable'
  | 'node.unknownType'
  | 'node.props.invalid'
  | 'edge.missingNode'
  | 'edge.invalidHandle'

export type ValidationIssue = {
  type: ValidationIssueType
  message: string

  nodeId?: string
  edgeId?: string

  details?: unknown
}

function isValidHandle(
  node: WorkflowNode,
  handleId: string | undefined,
  kind: 'input' | 'output'
): boolean {
  if (!handleId) return false

  const spec = nodeRegistry[node.type]
  if (!spec) return false

  const ports = kind === 'input' ? spec.inputs : spec.outputs
  return ports.some((p) => p.id === handleId)
}

function buildOutgoing(edges: WorkflowEdge[]): Map<string, WorkflowEdge[]> {
  const map = new Map<string, WorkflowEdge[]>()
  for (const e of edges) {
    const arr = map.get(e.source) ?? []
    arr.push(e)
    map.set(e.source, arr)
  }
  return map
}

function findStartNodes(nodes: WorkflowNode[]) {
  return nodes.filter((n) => n.type === 'core.start')
}

function findEndNodes(nodes: WorkflowNode[]) {
  return nodes.filter((n) => n.type === 'core.end')
}

function findReachableNodeIds(graph: WorkflowGraph): Set<string> {
  const start = findStartNodes(graph.nodes)[0]
  const reachable = new Set<string>()
  if (!start) return reachable

  const outgoing = buildOutgoing(graph.edges)
  const stack: string[] = [start.id]

  while (stack.length > 0) {
    const nodeId = stack.pop()
    if (!nodeId) continue
    if (reachable.has(nodeId)) continue

    reachable.add(nodeId)

    const edges = outgoing.get(nodeId) ?? []
    for (const e of edges) {
      stack.push(e.target)
    }
  }

  return reachable
}

function formatZodError(err: ZodError): unknown {
  return err.flatten()
}

export function validateGraph(
  input: unknown
):
  | { ok: true; graph: WorkflowGraph; issues: ValidationIssue[] }
  | { ok: false; issues: ValidationIssue[] } {
  const parsed = WorkflowGraphSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      issues: [
        {
          type: 'graph.parse',
          message: 'Graph does not match WorkflowGraphSchema.',
          details: parsed.error.flatten(),
        },
      ],
    }
  }

  const graph = parsed.data
  const issues: ValidationIssue[] = []

  // Validate start and end counts
  const starts = findStartNodes(graph.nodes)
  const ends = findEndNodes(graph.nodes)

  if (starts.length !== 1) {
    issues.push({
      type: 'graph.start.count',
      message: `Graph must contain exactly one Start node, found ${starts.length}.`,
    })
  }

  if (ends.length < 1) {
    issues.push({
      type: 'graph.end.count',
      message: 'Graph must contain at least one End node.',
    })
  }

  // Validate nodes against registry and validate props
  for (const node of graph.nodes) {
    const spec = nodeRegistry[node.type]
    if (!spec) {
      issues.push({
        type: 'node.unknownType',
        nodeId: node.id,
        message: `Unknown node type '${node.type}'.`,
      })
      continue
    }

    const result = spec.propsSchema.safeParse(node.data ?? {})
    if (!result.success) {
      issues.push({
        type: 'node.props.invalid',
        nodeId: node.id,
        message: `Invalid properties for node type '${node.type}'.`,
        details: formatZodError(result.error),
      })
    }
  }

  // Build node lookup
  const nodeById = new Map<string, WorkflowNode>()
  for (const n of graph.nodes) nodeById.set(n.id, n)

  // Validate edges
  for (const edge of graph.edges) {
    const sourceNode = nodeById.get(edge.source)
    const targetNode = nodeById.get(edge.target)

    if (!sourceNode || !targetNode) {
      issues.push({
        type: 'edge.missingNode',
        edgeId: edge.id,
        message: 'Edge references a missing source or target node.',
        details: {
          sourceExists: Boolean(sourceNode),
          targetExists: Boolean(targetNode),
          source: edge.source,
          target: edge.target,
        },
      })
      continue
    }

    if (!isValidHandle(sourceNode, edge.sourceHandle, 'output')) {
      issues.push({
        type: 'edge.invalidHandle',
        edgeId: edge.id,
        nodeId: sourceNode.id,
        message: `Invalid source handle '${edge.sourceHandle ?? ''}' for node '${sourceNode.type}'.`,
        details: { handle: edge.sourceHandle, kind: 'output' },
      })
    }

    if (!isValidHandle(targetNode, edge.targetHandle, 'input')) {
      issues.push({
        type: 'edge.invalidHandle',
        edgeId: edge.id,
        nodeId: targetNode.id,
        message: `Invalid target handle '${edge.targetHandle ?? ''}' for node '${targetNode.type}'.`,
        details: { handle: edge.targetHandle, kind: 'input' },
      })
    }
  }

  // Reachability check
  const reachable = findReachableNodeIds(graph)
  if (reachable.size > 0) {
    for (const node of graph.nodes) {
      if (!reachable.has(node.id)) {
        issues.push({
          type: 'graph.unreachable',
          nodeId: node.id,
          message: 'Node is unreachable from Start.',
        })
      }
    }
  }

  return { ok: true, graph, issues }
}
