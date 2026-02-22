import { zValidator } from '@hono/zod-validator'
import { zCheckRequestScheme } from '@licenseplate-checker/shared/validators'
import { Context, Hono } from 'hono'
import { schedules } from '@trigger.dev/sdk/v3'
import CityController from '../controllers/City.controller'
import WorkflowController from '../controllers/Workflow.controller'
import LicenseplateCheckController from '../controllers/LicensePlateCheck.controller'
import {
  buildVariableContext,
  executeWorkflowForCheck,
} from '../services/executeWorkflowForCheck'

export const licensePlateCheckRouter = new Hono()

const cityController = new CityController()
const workflowController = new WorkflowController()
const checkController = new LicenseplateCheckController()

/**
 * POST /new
 *
 * Creates a new license plate check.
 *
 * - Validates the request body against `zCheckRequestScheme`.
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
  zValidator('json', zCheckRequestScheme),
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

      if (body.workflowId) {
        const workflow = await workflowController.getById(body.workflowId)
        if (!workflow) {
          return c.json({ message: 'Workflow not found' }, 400)
        }
        if (!workflow.isPublished) {
          return c.json(
            { message: 'Workflow is not published and cannot be used' },
            400
          )
        }
      }

      const uppercaseLetters = String(body.letters).toUpperCase()

      const request = await checkController.createCheck({
        cityId: body.city,
        letters: uppercaseLetters,
        numbers: Number(body.numbers),
        userId: userId,
        workflowId: body.workflowId,
      })

      if (!request) {
        return c.json({ message: 'Check could not be created' }, 400)
      }

      // create daily schedule if workflow linked
      if (body.workflowId && request.id) {
        const hour = Math.floor(Math.random() * 24)
        const minute = Math.floor(Math.random() * 60)

        const schedule = await schedules.create({
          task: 'scheduled-check-execution',
          cron: `${minute} ${hour} * * *`,
          externalId: request.id,
          deduplicationKey: request.id,
        })

        await checkController.updateScheduleId(
          request.id,
          schedule.id,
          hour,
          minute
        )

        // run intitial check
        const variables = buildVariableContext({
          cityId: body.city,
          letters: uppercaseLetters,
          numbers: Number(body.numbers),
        })
        executeWorkflowForCheck(
          workflowController,
          body.workflowId,
          request.id,
          { variables }
        ).catch((err) => console.error('Initial check execution failed:', err))
      }

      return c.json(
        {
          checkId: request.id,
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
    const checks = await checkController.getByUserId(userId)

    return c.json({ checks }, 200)
  } catch (error) {
    console.error('Error fetching license plate checks:', error)
    return c.json(
      { message: 'An error occurred while fetching checks', error: error },
      500
    )
  }
})

licensePlateCheckRouter.put('/:id/workflow', async (c: Context) => {
  const user = c.get('user')
  const userId = user.id
  const checkId = c.req.param('id')
  const { workflowId } = await c.req.json<{ workflowId: string }>()

  if (!workflowId) {
    return c.json({ message: 'workflowId is required' }, 400)
  }

  const existingCheck = await checkController.getById(checkId)
  if (!existingCheck || existingCheck.userId !== userId) {
    return c.json({ message: 'Check not found' }, 404)
  }

  if (existingCheck.workflowId) {
    return c.json({ message: 'Check already has a workflow assigned' }, 400)
  }

  const workflow = await workflowController.getById(workflowId)
  if (!workflow) {
    return c.json({ message: 'Workflow not found' }, 400)
  }
  if (!workflow.isPublished) {
    return c.json({ message: 'Workflow is not published' }, 400)
  }

  const updated = await checkController.assignWorkflow(checkId, workflowId)

  // create daily schedule
  const hour = Math.floor(Math.random() * 24)
  const minute = Math.floor(Math.random() * 60)
  const schedule = await schedules.create({
    task: 'scheduled-check-execution',
    cron: `${minute} ${hour} * * *`,
    externalId: checkId,
    deduplicationKey: checkId,
  })
  await checkController.updateScheduleId(checkId, schedule.id, hour, minute)

  // run intitial check
  const variables = buildVariableContext({
    cityId: existingCheck.cityId,
    letters: existingCheck.letters,
    numbers: existingCheck.numbers,
  })
  executeWorkflowForCheck(workflowController, workflowId, checkId, {
    variables,
  }).catch((err) => console.error('Initial check execution failed:', err))

  return c.json({ check: updated }, 200)
})

licensePlateCheckRouter.delete('/delete/:id', async (c: Context) => {
  const user = c.get('user')
  const userId = user.id
  const checkId = c.req.param('id')

  if (!userId) {
    return c.json({ error: 'Invalid user ID in token' }, 401)
  }

  try {
    const existingCheck = await checkController.getById(checkId)

    if (!existingCheck || existingCheck.userId !== userId) {
      return c.json({ message: 'Check not found' }, 404)
    }

    if (existingCheck.triggerScheduleId) {
      try {
        await schedules.del(existingCheck.triggerScheduleId)
      } catch {
        console.error(
          'Failed to delete schedule:',
          existingCheck.triggerScheduleId
        )
      }
    }

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
