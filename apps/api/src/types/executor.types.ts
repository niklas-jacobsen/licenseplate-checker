import { BadRequestError, InternalServerError, NotFoundError } from './error.types'

export type ExecutionLog = {
  timestamp: string
  level: 'info' | 'error' | 'debug'
  message: string
  details?: unknown
}

export type ExecutionResult = {
  success: boolean
  logs: ExecutionLog[]
  error?: string
}

export class BlockNotFoundError extends NotFoundError {
  constructor(blockId: string) {
    super(`Block ${blockId} not found`, 'BLOCK_NOT_FOUND', { blockId })
  }
}

export class UnknownBlockKindError extends BadRequestError {
  constructor(kind: string) {
    super(`Unknown block kind: ${kind}`, 'UNKNOWN_BLOCK_KIND', { kind })
  }
}

export class BrowserInitializationError extends InternalServerError {
  constructor() {
    super('Browser page not initialized', 'BROWSER_INIT_ERROR')
  }
}

export class UnknownActionTypeError extends BadRequestError {
  constructor(type: string) {
    super(`Unknown action type: ${type}`, 'UNKNOWN_ACTION_TYPE', { type })
  }
}

export class UnknownConditionOpError extends BadRequestError {
  constructor(op: string) {
    super(`Unknown condition op: ${op}`, 'UNKNOWN_CONDITION_OP', { op })
  }
}
