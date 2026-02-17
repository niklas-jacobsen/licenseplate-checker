
export class AppError extends Error {
  public statusCode: number
  public code?: string
  public details?: unknown

  constructor(message: string, statusCode = 500, code?: string, details?: unknown) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
    this.name = this.constructor.name
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, code?: string, details?: unknown) {
    super(message, 400, code, details)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, code?: string, details?: unknown) {
    super(message, 401, code, details)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, code?: string, details?: unknown) {
    super(message, 403, code, details)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, code?: string, details?: unknown) {
    super(message, 404, code, details)
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code?: string, details?: unknown) {
    super(message, 409, code, details)
  }
}

export class InternalServerError extends AppError {
  constructor(message: string, code?: string, details?: unknown) {
    super(message, 500, code, details)
  }
}
