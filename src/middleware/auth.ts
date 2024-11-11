import { Secret, JwtPayload } from 'jsonwebtoken';
import AuthController from '../controllers/Authorization.controller';
import { Context, Next } from 'hono';

export const SECRET_KEY: Secret = process.env.JWT_SECRET ?? '';
if (!SECRET_KEY) {
  throw new Error('JWT_SECRET not set in .env');
}

export interface CustomRequest extends Request {
  token: string | JwtPayload;
}

export const auth = async (c: Context, next: Next) => {
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
  } catch (err) {
    return c.json({ status: 'error', message: 'Could not authenticate' }, 401);
  }
};
