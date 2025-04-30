import { zValidator } from '@hono/zod-validator'
import { zRequestScheme } from '@licenseplate-checker/shared/validators'
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
      const body = await c.req.json()

      // Check if the city exists
      const cityIntialsExist = await cityController.getById(body.city)
      if (!cityIntialsExist) {
        return c.json({ message: 'City initials not a valid German city' }, 400)
      }

      // Check if request already exists for the same user
      const existingRequest = await requestController.getById({
        city: body.city,
        letters: body.letters,
        numbers: body.numbers,
        user,
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
        body.letters,
        body.numbers,
        user
      )

      if (!request) {
        return c.json({ message: 'Request could not be created' }, 400)
      }

      // Return confirmation message
      return c.json(
        {
          message: `Request ${body.city}-${body.letters}-${body.numbers} was created successfully`,
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
