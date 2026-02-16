import { zValidator } from '@hono/zod-validator'
import { zRequestScheme } from '@shared/validators'
import { Context, Hono } from 'hono'
import CityController from '../controllers/City.controller'
import LicenseplateCheckController from '../controllers/LicensePlateCheck.controller'

export const licensePlateCheckRouter = new Hono()

const cityController = new CityController()
const checkController = new LicenseplateCheckController()

/**
 * POST /new
 *
 * Creates a new license plate check.
 *
 * - Validates the request body against `zRequestScheme`.
 * - Checks if the city exists.
 * - Creates a new license plate check if all validations pass.
 *
 * Request Body (JSON):
 * - city (string): The ID of the city.
 * - letters (string): The letter part of the license plate.
 * - numbers (number): The numeric part of the license plate.
 *
 * Responses:
 * - 200: Check created successfully.
 * - 400: If city does not exist or parameters are invalid.
 * - 500: If an internal server error occurred.
 *
 * @param {Context} c - The context for the request. Contains request parameters
 * @returns {Promise<Response>} The response object.
 */
licensePlateCheckRouter.post(
  '/new',
  zValidator('json', zRequestScheme),
  async (c: Context) => {
    try {
      const user = c.get('user')
      const userId = user.id
      const body = await c.req.json()

      // Check if the city exists
      const cityExists = await cityController.getById(body.city)
      if (!cityExists) {
        return c.json(
          { message: `City initials ${body.city} not a valid German city` },
          400
        )
      }

      const uppercaseLetters = String(body.letters).toUpperCase()

      // Create a new license plate check
      const request = await checkController.createCheck({
        cityId: body.city,
        letters: uppercaseLetters,
        numbers: Number(body.numbers),
        userId: userId,
      })

      if (!request) {
        return c.json({ message: 'Check could not be created' }, 400)
      }

      // Return confirmation message
      return c.json(
        {
          message: `Check for ${body.city}-${uppercaseLetters}-${body.numbers} was created successfully`,
        },
        200
      )
    } catch (error) {
      return c.json(
        { message: 'An error occurred when performing the request:', error },
        500
      )
    }
  }
)

licensePlateCheckRouter.get('/me', async (c: Context) => {
  const user = c.get('user')
  const userId = user.id

  if (!userId) {
    return c.json({ error: 'Invalid user ID in token' }, 401)
  }

  try {
    // Get all checks for the authenticated user
    const checks = await checkController.getByUserId(userId)

    // If no checks are found, return a 404 response
    if (checks.length === 0) {
      return c.json({ message: 'No checks found for this user' }, 404)
    }

    // Return the found checks
    return c.json({ checks }, 200)
  } catch (error) {
    console.error('Error fetching license plate checks:', error)
    return c.json(
      { message: 'An error occurred while fetching checks', error: error },
      500
    )
  }
})

licensePlateCheckRouter.delete('/delete/:id', async (c: Context) => {
  const user = c.get('user')
  const userId = user.id
  const checkId = c.req.param('id')

  if (!userId) {
    return c.json({ error: 'Invalid user ID in token' }, 401)
  }

  try {
    // Check if the check exists and belongs to the user
    const existingCheck = await checkController.getById(checkId)

    if (!existingCheck || existingCheck.userId !== userId) {
      return c.json({ message: 'Check not found' }, 404)
    }

    // Delete the check
    await checkController.deleteCheck(checkId)

    return c.json({ message: 'Check successfully deleted' }, 200)
  } catch (error) {
    console.error('Error deleting license plate check:', error)
    return c.json(
      {
        message: 'An error occurred while deleting the check',
        error: error,
      },
      500
    )
  }
})
