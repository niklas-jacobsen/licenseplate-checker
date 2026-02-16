export class InvalidTokenError extends Error {
  constructor() {
    super('Invalid token payload')
    this.name = 'InvalidTokenError'
  }
}

export class MissingTokenError extends Error {
  constructor() {
    super('Authorization token is missing or invalid')
    this.name = 'MissingTokenError'
  }
}
