import { Hono } from 'hono';
import { ENV } from '../env';
import { auth } from '../middleware/auth';
import { zValidator } from '@hono/zod-validator';
import UserController from '../controllers/User.controller';
import { zUserScheme } from '../validators/zodSchemes';
import AuthController from '../controllers/Authorization.controller';

export const authRouter = new Hono();

const userController = new UserController();
const authController = new AuthController();

authRouter.post('/register', zValidator('json', zUserScheme), async (c) => {
  const { email, password } = await c.req.json<{
    email: string;
    password: string;
  }>();

  if (await userController.getByEmail(email)) {
    return c.json({ error: 'User already exists' }, 400);
  }

  const user = await userController.create({
    email: email,
    password: await authController.hashPassword(password),
  });

  return c.json(user);
});
