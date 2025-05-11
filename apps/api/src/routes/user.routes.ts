import { Hono, Context } from 'hono'
import UserController from '../controllers/User.controller'
import auth from '../middleware/auth'
import { zValidator } from '@hono/zod-validator'
import { zUserUpdateScheme } from '@shared/validators'
import { string } from 'zod'

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

userRouter.put(
  '/me',
  auth,
  zValidator('json', zUserUpdateScheme),
  async (c: Context) => {
    const {
      email,
      firstname,
      lastname,
      salutation,
      street,
      streetNumber,
      zipCode,
      city,
    } = await c.req.json<{
      email?: string
      firstname?: string
      lastname?: string
      salutation?: string
      street?: string
      streetNumber?: string
      zipCode?: string
      city?: string
    }>()
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

      const updatedUser = await userController.update(userId, {
        email: email ?? user?.email,
        firstname: firstname ?? user?.firstname,
        lastname: lastname ?? user?.lastname,
        street: street ?? user?.street,
        streetNumber: streetNumber ?? user?.streetNumber,
        zipcode: zipCode ? Number(zipCode) : user?.zipcode,
        city: city ?? user?.city,
      })

      if (!updatedUser) {
        return c.json({ error: 'User not found' }, 404)
      }
      console.log(updatedUser)
      const { password, birthdate, salutation, createdAt, ...safeUser } =
        updatedUser
      return c.json(safeUser, 200)
    } catch (error) {
      return c.json({ message: 'Failed to update user', error }, 500)
    }
  }
)
