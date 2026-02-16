import { WorkflowGraphSchema } from '@shared/workflow-dsl'
import type {
  WorkflowGraph,
  WorkflowNode,
  WorkflowEdge,
} from '@shared/workflow-dsl'
import type {
  BuilderIr,
  ActionOp,
  BranchCondition,
  IrBlock,
} from '@shared/builder-ir'
import { nodeRegistry, BUILDER_REGISTRY_VERSION } from '@shared/node-registry'

import type {
  CompileIssue,
  CompileError as CompileErrorType,
} from '../../types/compiler.types'
import { CompileError } from '../../types/compiler.types'
type OutgoingByHandle = Map<string, Map<string, WorkflowEdge[]>>

// prefix ids to avoid collisions in ir
function blockIdForNode(nodeId: string) {
  return `b_${nodeId}`
}

function findStartNodes(nodes: WorkflowNode[]) {
  return nodes.filter((n) => n.type === 'core.start')
}

function findEndNodes(nodes: WorkflowNode[]) {
  return nodes.filter((n) => n.type === 'core.end')
}

function buildNodeById(nodes: WorkflowNode[]) {
  const map = new Map<string, WorkflowNode>()
  for (const n of nodes) map.set(n.id, n)
  return map
}

// index outgoing edges by source node and handle id
function buildOutgoingByHandle(edges: WorkflowEdge[]): OutgoingByHandle {
  const map: OutgoingByHandle = new Map()

  for (const e of edges) {
    const byHandle = map.get(e.source) ?? new Map<string, WorkflowEdge[]>()
    const handleId = e.sourceHandle ?? ''
    const list = byHandle.get(handleId) ?? []
    list.push(e)
    byHandle.set(handleId, list)
    map.set(e.source, byHandle)
  }

  return map
}

// ensure strict 1:1 connection for linear flow
function getSingleEdge(
  outgoing: OutgoingByHandle,
  nodeId: string,
  handleId: string,
  issues: CompileIssue[]
): WorkflowEdge | undefined {
  const byHandle = outgoing.get(nodeId)
  const edges = byHandle?.get(handleId) ?? []

  if (edges.length === 0) return undefined

  if (edges.length > 1) {
    issues.push({
      type: 'edge.missingConnection',
      nodeId,
      message: `Expected exactly one outgoing edge from handle '${handleId}', found ${edges.length}.`,
      details: { handleId, edgeIds: edges.map((e) => e.id) },
    })
    return undefined
  }

  return edges[0]
}

// verify connection points actually exist on the node definition
function assertHandleAllowed(
  node: WorkflowNode,
  kind: 'input' | 'output',
  handleId: string | undefined,
  issues: CompileIssue[],
  edgeId?: string
) {
  if (!handleId) {
    issues.push({
      type: 'edge.invalidHandle',
      nodeId: node.id,
      edgeId,
      message: `Missing ${kind} handle id.`,
    })
    return
  }

  const spec = nodeRegistry[node.type]
  if (!spec) return

  const ports = kind === 'input' ? spec.inputs : spec.outputs
  const ok = ports.some((p) => p.id === handleId)

  if (!ok) {
    issues.push({
      type: 'edge.invalidHandle',
      nodeId: node.id,
      edgeId,
      message: `Invalid ${kind} handle '${handleId}' for node type '${node.type}'.`,
      details: { handleId, kind, allowed: ports.map((p) => p.id) },
    })
  }
}

// map specific node types to ir ops
function toActionOp(node: WorkflowNode): ActionOp | undefined {
  switch (node.type) {
    case 'core.openPage':
      return { type: 'openPage', url: node.data.config.url }

    case 'core.click':
      return { type: 'click', selector: node.data.config.selector }

    case 'core.typeText':
      return {
        type: 'typeText',
        selector: node.data.config.selector,
        text: node.data.config.text,
      }

    default:
      return undefined
  }
}

// extract operator logic from config
function toBranchCondition(node: WorkflowNode): BranchCondition | undefined {
  if (node.type !== 'core.conditional') return undefined

  const config = node.data.config

  if (config.operator === 'exists') {
    return { op: 'exists', selector: config.selector }
  }

  if (config.operator === 'textIncludes') {
    return {
      op: 'textIncludes',
      selector: config.selector,
      value: config.value,
    }
  }

  return undefined
}

function validateGraphForCompile(graph: WorkflowGraph): CompileIssue[] {
  const issues: CompileIssue[] = []

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

    // validate the specific config object against schema
    const parsed = spec.propsSchema.safeParse(node.data.config ?? {})
    if (!parsed.success) {
      issues.push({
        type: 'node.props.invalid',
        nodeId: node.id,
        message: `Invalid properties for node type '${node.type}'.`,
        details: parsed.error.flatten(),
      })
    }
  }

  const nodeById = buildNodeById(graph.nodes)

  for (const edge of graph.edges) {
    const sourceNode = nodeById.get(edge.source)
    const targetNode = nodeById.get(edge.target)

    if (!sourceNode || !targetNode) {
      issues.push({
        type: 'edge.missingConnection',
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

    assertHandleAllowed(
      sourceNode,
      'output',
      edge.sourceHandle,
      issues,
      edge.id
    )
    assertHandleAllowed(targetNode, 'input', edge.targetHandle, issues, edge.id)
  }

  return issues
}

export function compileGraphToIr(input: unknown): BuilderIr {
  const parsed = WorkflowGraphSchema.safeParse(input)
  if (!parsed.success) {
    throw new CompileError('Graph does not match WorkflowGraphSchema.', [
      {
        type: 'graph.parse',
        message: 'Graph does not match WorkflowGraphSchema.',
        details: parsed.error.flatten(),
      },
    ])
  }

  const graph = parsed.data
  const issues = validateGraphForCompile(graph)

  const startNode = findStartNodes(graph.nodes)[0]
  if (!startNode) {
    throw new CompileError(
      'Cannot compile graph, Start node is missing.',
      issues
    )
  }

  const _nodeById = buildNodeById(graph.nodes)
  const outgoing = buildOutgoingByHandle(graph.edges)

  const blocks: Record<string, IrBlock> = {}

  for (const node of graph.nodes) {
    const id = blockIdForNode(node.id)

    // entry block
    if (node.type === 'core.start') {
      const edge = getSingleEdge(outgoing, node.id, 'next', issues)
      if (!edge) {
        issues.push({
          type: 'node.missingNext',
          nodeId: node.id,
          message: "Start node must have an outgoing connection from 'next'.",
        })
        continue
      }

      blocks[id] = {
        id,
        kind: 'start',
        sourceNodeId: node.id,
        next: blockIdForNode(edge.target),
      }
      continue
    }

    // terminal block
    if (node.type === 'core.end') {
      blocks[id] = {
        id,
        kind: 'end',
        sourceNodeId: node.id,
      }
      continue
    }

    // branching logic
    if (node.type === 'core.conditional') {
      const trueEdges = outgoing.get(node.id)?.get('true') ?? []
      const falseEdges = outgoing.get(node.id)?.get('false') ?? []

      if (trueEdges.length === 0 || falseEdges.length === 0) {
        issues.push({
          type: 'node.missingBranch',
          nodeId: node.id,
          message:
            "Condition node must have one 'true' edge and one 'false' edge.",
          details: {
            trueCount: trueEdges.length,
            falseCount: falseEdges.length,
          },
        })
        continue
      }

      if (trueEdges.length > 1 || falseEdges.length > 1) {
        issues.push({
          type: 'node.duplicateBranchEdge',
          nodeId: node.id,
          message: 'Condition node must not have multiple edges per branch.',
          details: {
            trueEdgeIds: trueEdges.map((e) => e.id),
            falseEdgeIds: falseEdges.map((e) => e.id),
          },
        })
        continue
      }

      const condition = toBranchCondition(node)
      // double-check condition validity
      if (!condition) {
        issues.push({
          type: 'node.props.invalid',
          nodeId: node.id,
          message: 'Condition node has invalid operator configuration.',
        })
        continue
      }

      blocks[id] = {
        id,
        kind: 'branch',
        sourceNodeId: node.id,
        condition,
        whenTrue: blockIdForNode(trueEdges[0].target),
        whenFalse: blockIdForNode(falseEdges[0].target),
      }
      continue
    }

    // standard action
    const op = toActionOp(node)
    if (!op) {
      issues.push({
        type: 'node.unknownType',
        nodeId: node.id,
        message: `Node type '${node.type}' is not compilable as an action.`,
      })
      continue
    }

    const edge = getSingleEdge(outgoing, node.id, 'next', issues)
    if (!edge) {
      issues.push({
        type: 'node.missingNext',
        nodeId: node.id,
        message: `Node type '${node.type}' must have an outgoing connection from 'next'.`,
      })
      continue
    }

    blocks[id] = {
      id,
      kind: 'action',
      sourceNodeId: node.id,
      op,
      next: blockIdForNode(edge.target),
    }
  }

  if (issues.length > 0) {
    throw new CompileError(
      'Compilation failed due to validation issues.',
      issues
    )
  }

  const ir: BuilderIr = {
    irVersion: 'v1',
    registryVersion: graph.registryVersion || BUILDER_REGISTRY_VERSION,
    entryBlockId: blockIdForNode(startNode.id),
    blocks,
    meta: graph.meta,
  }

  return ir
}
