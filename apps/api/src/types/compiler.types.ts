import { BadRequestError } from '@licenseplate-checker/shared/types'

export type CompileIssueType =
  | 'graph.parse'
  | 'graph.start.count'
  | 'graph.end.count'
  | 'node.unknownType'
  | 'node.props.invalid'
  | 'edge.invalidHandle'
  | 'edge.missingConnection'
  | 'node.missingNext'
  | 'node.missingBranch'
  | 'node.duplicateBranchEdge'

export type CompileIssue = {
  type: CompileIssueType
  message: string
  nodeId?: string
  edgeId?: string
  details?: unknown
}

export class CompileError extends BadRequestError {
  public issues: CompileIssue[]

  constructor(message: string, issues: CompileIssue[]) {
    super(message, 'COMPILE_ERROR', { issues })
    this.issues = issues
  }
}
