import { Hono, Context } from 'hono'
import UserController from '../controllers/User.controller'
import auth from '../middleware/auth'

export const userRouter = new Hono()

const userController = new UserController()

/**
 * GET /me
 *
 * Returns the currently authenticated user.
 * Requires a valid Bearer token in the Authorization header.
 */
userRouter.get('/me', auth, async (c: Context) => {
  const userPayload = c.get('user')

  const userId =
    typeof userPayload === 'object' && 'id' in userPayload
      ? userPayload.id
      : null

  if (!userId) {
    return c.json({ error: 'Invalid user ID in token' }, 401)
  }

  try {
    const user = await userController.getById(userId)
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    const { password, ...safeUser } = user
    return c.json(safeUser, 200)
  } catch (error) {
    return c.json({ message: 'Failed to fetch user', error }, 500)
  }
})
