import { Hono } from 'hono';
import { ENV } from '../env';
import auth from '../middleware/auth';
import { zValidator } from '@hono/zod-validator';
import UserController from '../controllers/User.controller';
import { zUserScheme } from '../validators/zodSchemes';
import AuthController from '../controllers/Authorization.controller';

export const authRouter = new Hono();

const userController = new UserController();
const authController = new AuthController();

authRouter.post('/register', zValidator('json', zUserScheme), async (c) => {
  try {
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
  } catch (error) {
    return c.json({ message: 'Error during Sign Up', error }, 500);
  }
});

authRouter.post('/login', zValidator('json', zUserScheme), async (c) => {
  try {
    const { email, password } = await c.req.json<{
      email: string;
      password: string;
    }>();

    const user = await userController.getByEmail(email);

    if (!user) {
      return c.json({ error: 'User does not exists' }, 400);
    }

    if (!(await authController.verifyPassword(password, user.password))) {
      return c.json({ error: 'Incorrect password' }, 400);
    }

    return c.json(
      {
        message: 'User logged in',
        token: await authController.generateJWT(user.id),
      },
      200
    );
  } catch (error) {
    return c.json({ message: 'Error logging in user', error }, 500);
  }
});
