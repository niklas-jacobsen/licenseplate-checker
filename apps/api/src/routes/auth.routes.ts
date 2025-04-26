import { zValidator } from '@hono/zod-validator'
import { zUserScheme } from '@licenseplate-checker/shared/validators'
import { Hono } from 'hono'
import AuthController from '../controllers/Authorization.controller'
import UserController from '../controllers/User.controller'

export const authRouter = new Hono()

const userController = new UserController()
const authController = new AuthController()

/**
 * POST /register
 *
 * Registers a new user.
 *
 * - Validates the request body against `zUserScheme`.
 * - Checks if the user already exists by email.
 * - Creates a new user and hashes the password before saving.
 *
 * Request Body (JSON):
 * - email (string): The email address of the user.
 * - password (string): The password for the user.
 *
 * Responses:
 * - 200: User created successfully with user details in the response.
 * - 400: If the user already exists or validation fails.
 * - 500: If an internal server error occurs.
 *
 * @param {Context} c - The context for the request. Contains the request parameters.
 * @returns {Promise<Response>} The response object.
 */
authRouter.post('/register', zValidator('json', zUserScheme), async (c) => {
  try {
    const { email, password } = await c.req.json<{
      email: string
      password: string
    }>()

    // Check if the user already exists
    const userExists = await userController.getByEmail(email)
    if (userExists) {
      return c.json({ error: 'User already exists' }, 400)
    }

    // Create a new user with a hashed password
    const user = await userController.create({
      email: email,
      password: await authController.hashPassword(password),
    })

    return c.json(user)
  } catch (error) {
    return c.json({ message: 'Error during Sign Up', error }, 500)
  }
})

/**
 * POST /login
 *
 * Logs in an existing user.
 *
 * - Validates the request body against `zUserScheme`.
 * - Verifies the user's credentials (email and password).
 * - Generates and returns a JWT token for the user upon successful login.
 *
 * Request Body (JSON):
 * - email (string): The email address of the user.
 * - password (string): The password for the user.
 *
 * Responses:
 * - 200: User logged in successfully with a token in the response.
 * - 400: If the user does not exist or the password is incorrect.
 * - 500: If an internal server error occurs.
 *
 * @param {Context} c - The context for the request. Contains request parameters.
 * @returns {Promise<Response>} The response object.
 */
authRouter.post('/login', zValidator('json', zUserScheme), async (c) => {
  try {
    const { email, password } = await c.req.json<{
      email: string
      password: string
    }>()

    // Check whether user exists
    const user = await userController.getByEmail(email)
    if (!user) {
      return c.json({ error: 'User does not exists' }, 400)
    }

    // Verify the provided password
    const passwordResult = await authController.verifyPassword(
      password,
      user.password
    )
    if (!passwordResult) {
      return c.json({ error: 'Incorrect password' }, 400)
    }

    // Generate a JWT token for the user
    return c.json(
      {
        message: 'User logged in',
        token: await authController.generateJWT(user.id),
      },
      200
    )
  } catch (error) {
    return c.json({ message: 'Error logging in user', error }, 500)
  }
})
