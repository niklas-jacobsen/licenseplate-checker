import { JwtPayload } from 'jsonwebtoken';
import AuthController from '../controllers/Authorization.controller';
import { Context, Next } from 'hono';

export interface CustomRequest extends Request {
  token: string | JwtPayload;
}

const auth = async (c: Context, next: Next) => {
  const authController = new AuthController();
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = await authController.verifyJWT(token);
    if (!decoded) {
      throw new Error();
    }

    c.set('user', decoded);
    c.set('token', token);

    await next();
  } catch (error) {
    return c.json({ status: 'error', message: error }, 401);
  }
};

export default auth;
