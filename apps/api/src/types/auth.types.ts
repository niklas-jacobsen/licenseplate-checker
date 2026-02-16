import { UnauthorizedError } from './error.types'

export class InvalidTokenError extends UnauthorizedError {
  constructor() {
    super('Invalid token payload', 'INVALID_TOKEN')
  }
}

export class MalformedTokenError extends UnauthorizedError {
  constructor() {
    super('Authorization token is malformed', 'MALFORMED_TOKEN')
  }
}

export class MissingTokenError extends UnauthorizedError {
  constructor() {
    super('Authorization token is missing or invalid', 'MISSING_TOKEN')
  }
}
