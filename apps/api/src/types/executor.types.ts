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

export class BlockNotFoundError extends Error {
  constructor(blockId: string) {
    super(`Block ${blockId} not found`)
    this.name = 'BlockNotFoundError'
  }
}

export class UnknownBlockKindError extends Error {
  constructor(kind: string) {
    super(`Unknown block kind: ${kind}`)
    this.name = 'UnknownBlockKindError'
  }
}

export class BrowserInitializationError extends Error {
  constructor() {
    super('Browser page not initialized')
    this.name = 'BrowserInitializationError'
  }
}

export class UnknownActionTypeError extends Error {
  constructor(type: string) {
    super(`Unknown action type: ${type}`)
    this.name = 'UnknownActionTypeError'
  }
}

export class UnknownConditionOpError extends Error {
  constructor(op: string) {
    super(`Unknown condition op: ${op}`)
    this.name = 'UnknownConditionOpError'
  }
}
