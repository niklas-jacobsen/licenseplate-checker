import { zValidator } from '@hono/zod-validator'
import { zRequestScheme } from '@shared/validators'
import { Context, Hono } from 'hono'
import CityController from '../controllers/City.controller'
import LicenseplateRequestController from '../controllers/LicensePlateRequest.controller'

export const licensePlateRequestRouter = new Hono()

const cityController = new CityController()
const requestController = new LicenseplateRequestController()

/**
 * POST /new
 *
 * Creates a new license plate request.
 *
 * - Validates the request body against `zRequestScheme`.
 * - Checks if the city exists.
 * - Checks if a similar request already exists for the user.
 * - Creates a new license plate request if all validations pass.
 *
 * Request Body (JSON):
 * - city (string): The ID of the city.
 * - letters (string): The letter part of the license plate.
 * - numbers (string): The numeric part of the license plate.
 *
 * Responses:
 * - 200: Request created successfully.
 * - 400: If city does not exist, request parameters are invalid, or a duplicate request exists.
 * - 500: If an internal server error occurred.
 *
 * @param {Context} c - The context for the request. Contains request parameters
 * @returns {Promise<Response>} The response object.
 */
licensePlateRequestRouter.post(
  '/new',
  zValidator('json', zRequestScheme),
  async (c: Context) => {
    try {
      const user = c.get('user')
      const userId = user.id
      const body = await c.req.json()

      // Check if the city exists
      const cityIntialsExist = await cityController.getById(body.city)
      if (!cityIntialsExist) {
        return c.json(
          { message: `City initials ${body.city} not a valid German city` },
          400
        )
      }

      const uppercaseLetters = String(body.letters).toUpperCase()

      // Check if request already exists for the same user
      const existingRequest = await requestController.getById({
        city: body.city,
        letters: uppercaseLetters,
        numbers: body.numbers,
        user: userId,
      })
      if (existingRequest) {
        return c.json(
          { message: 'A request with these parameters already exists' },
          400
        )
      }

      // Create a new license plate request
      const request = await requestController.createRequest(
        body.city,
        uppercaseLetters,
        body.numbers,
        userId
      )

      if (!request) {
        return c.json({ message: 'Request could not be created' }, 400)
      }

      // Return confirmation message
      return c.json(
        {
          message: `Request ${body.city}-${uppercaseLetters}-${body.numbers} was created successfully`,
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

licensePlateRequestRouter.get('/me', async (c: Context) => {
  const user = c.get('user')
  const userId = user.id

  if (!userId) {
    return c.json({ error: 'Invalid user ID in token' }, 401)
  }

  try {
    // Get all requests for the authenticated user
    const requests = await requestController.getByUserId(userId)

    // If no requests are found, return a 404 response
    if (requests.length === 0) {
      return c.json({ message: 'No requests found for this user' }, 404)
    }

    // Return the found requests
    return c.json({ requests }, 200)
  } catch (error) {
    console.error('Error fetching license plate requests:', error)
    return c.json(
      { message: 'An error occurred while fetching requests', error: error },
      500
    )
  }
})

licensePlateRequestRouter.delete('/delete', async (c: Context) => {
  const user = c.get('user')
  const userId = user.id
  const body = await c.req.json()

  if (!userId) {
    return c.json({ error: 'Invalid user ID in token' }, 401)
  }

  if (!body.city || !body.letters || !body.numbers) {
    return c.json(
      {
        error: 'Missing required fields: city, letterRequest, or numberRequest',
      },
      400
    )
  }

  const uppercaseLetters = String(body.letters).toUpperCase()

  try {
    // Check if the request exists
    const existingRequest = await requestController.getById({
      city: body.city,
      letters: uppercaseLetters,
      numbers: body.numbers,
      user: userId,
    })

    if (!existingRequest) {
      return c.json({ message: 'Request not found' }, 404)
    }

    // Delete the request
    await requestController.deleteRequest({
      city: body.city,
      letters: uppercaseLetters,
      numbers: body.numbers,
      user: userId,
    })

    return c.json({ message: 'Request successfully deleted' }, 200)
  } catch (error) {
    console.error('Error deleting license plate request:', error)
    return c.json(
      {
        message: 'An error occurred while deleting the request',
        error: error,
      },
      500
    )
  }
})
