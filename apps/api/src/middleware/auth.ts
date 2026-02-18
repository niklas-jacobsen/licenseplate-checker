import { Context, Next } from 'hono'
import { JwtPayload } from 'jsonwebtoken'
import AuthController from '../controllers/Authorization.controller'
import { InvalidTokenError, MalformedTokenError, MissingTokenError } from '../types/auth.types'

export interface CustomRequest extends Request {
  token: string | JwtPayload
}

const auth = async (c: Context, next: Next) => {
  const authController = new AuthController()
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')

    // token missing
    if (!token) {
      throw new MissingTokenError()
    }

    // token malformed
    const decoded = await authController.verifyJWT(token)
    if (!decoded) {
      throw new MalformedTokenError()
    }

    c.set('user', {
      id: decoded.id,
    })
    c.set('token', token)

    await next()
  } catch (error) {
    if (error instanceof MissingTokenError || error instanceof InvalidTokenError) {
      throw error
    }
    
    // token invalid fallback
    throw new InvalidTokenError()
  }
}

export default auth
