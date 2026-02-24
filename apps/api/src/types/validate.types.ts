export type ValidationIssueType =
  | 'graph.parse'
  | 'graph.start.count'
  | 'graph.end.count'
  | 'graph.end.missingOutcome'
  | 'graph.nodeLimit'
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