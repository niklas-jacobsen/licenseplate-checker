import { Context, Next } from 'hono'
import { JwtPayload } from 'jsonwebtoken'
import AuthController from '../controllers/Authorization.controller'

export interface CustomRequest extends Request {
  token: string | JwtPayload
}

const auth = async (c: Context, next: Next) => {
  const authController = new AuthController()
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      throw new Error()
    }

    const decoded = await authController.verifyJWT(token)
    if (!decoded) {
      return c.json(
        { status: 'error', message: 'Authorization token is missing' },
        401
      )
    }

    c.set('user', {
      id: decoded.id,
    })
    c.set('token', token)

    await next()
  } catch (error) {
    return c.json({ status: 'error', message: error }, 401)
  }
}

export default auth
