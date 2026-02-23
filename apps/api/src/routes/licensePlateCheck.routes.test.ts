import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from 'bun:test'
import { Hono } from 'hono'
import { errorHandler } from '../app'

import { schedules } from '@trigger.dev/sdk/v3'
import CityController from '../controllers/City.controller'
import LicenseplateCheckController from '../controllers/LicensePlateCheck.controller'
import WorkflowController from '../controllers/Workflow.controller'
import * as executeModule from '../services/executeWorkflowForCheck'

let cityGetByIdSpy: any
let checkCreateSpy: any
let checkGetByUserIdSpy: any
let checkDeleteSpy: any
let checkGetByIdSpy: any
let checkAssignWorkflowSpy: any
let checkUpdateScheduleIdSpy: any
let workflowGetByIdSpy: any
let schedulesCreateSpy: any
let schedulesDelSpy: any
let executeWorkflowSpy: any

// mock env variable
type AppEnv = {
  Variables: {
    user: { id: string }
  }
}

async function makeApp(setupMiddleware?: (app: Hono<AppEnv>) => void) {
  const { licensePlateCheckRouter } = await import('./licensePlateCheck.routes')
  const app = new Hono<AppEnv>()
  if (setupMiddleware) {
    setupMiddleware(app)
  }
  app.onError(errorHandler)
  app.route('/check', licensePlateCheckRouter)
  return app
}

describe('License Plate Check Routes', () => {
  beforeAll(() => {
    cityGetByIdSpy = spyOn(CityController.prototype, 'getById')
    checkCreateSpy = spyOn(LicenseplateCheckController.prototype, 'createCheck')
    checkGetByUserIdSpy = spyOn(
      LicenseplateCheckController.prototype,
      'getByUserId'
    )
    checkDeleteSpy = spyOn(LicenseplateCheckController.prototype, 'deleteCheck')
    checkGetByIdSpy = spyOn(LicenseplateCheckController.prototype, 'getById')
    checkAssignWorkflowSpy = spyOn(
      LicenseplateCheckController.prototype,
      'assignWorkflow'
    )
    checkUpdateScheduleIdSpy = spyOn(
      LicenseplateCheckController.prototype,
      'updateScheduleId'
    )
    workflowGetByIdSpy = spyOn(WorkflowController.prototype, 'getById')
    schedulesCreateSpy = spyOn(schedules, 'create')
    schedulesDelSpy = spyOn(schedules, 'del')
    executeWorkflowSpy = spyOn(executeModule, 'executeWorkflowForCheck')
  })

  afterAll(() => {
    mock.restore()
  })

  beforeEach(() => {
    cityGetByIdSpy.mockClear()
    checkCreateSpy.mockClear()
    checkGetByUserIdSpy.mockClear()
    checkDeleteSpy.mockClear()
    checkGetByIdSpy.mockClear()
    checkAssignWorkflowSpy.mockClear()
    checkUpdateScheduleIdSpy.mockClear()
    workflowGetByIdSpy.mockClear()
    schedulesCreateSpy.mockClear()
    schedulesDelSpy.mockClear()
    executeWorkflowSpy.mockClear()
  })

  describe('POST /check/new', () => {
    it('creates a new check successfully', async () => {
      const app = await makeApp((app) => {
        app.use('*', async (c, next) => {
          c.set('user', { id: 'user1' })
          await next()
        })
      })
      const payload = { city: 'HAM', letters: 'AB', numbers: '123' }

      cityGetByIdSpy.mockResolvedValue({ id: 'HAM', name: 'Hamburg' })
      checkCreateSpy.mockResolvedValue({
        id: 'check1',
        ...payload,
        numbers: 123,
        userId: 'user1',
      })

      const res = await app.request('/check/new', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.message).toContain('created successfully')
      expect(cityGetByIdSpy).toHaveBeenCalledWith('HAM')
      expect(checkCreateSpy).toHaveBeenCalledWith({
        cityId: 'HAM',
        letters: 'AB',
        numbers: 123,
        userId: 'user1',
      })
    })

    it('returns 400 if city not found', async () => {
      const app = await makeApp((app) => {
        app.use('*', async (c, next) => {
          c.set('user', { id: 'user1' })
          await next()
        })
      })
      const payload = { city: 'UNK', letters: 'AB', numbers: '123' }

      cityGetByIdSpy.mockResolvedValue(null)

      const res = await app.request('/check/new', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })

      expect(res.status).toBe(400)
      expect(cityGetByIdSpy).toHaveBeenCalledWith('UNK')
      expect(checkCreateSpy).not.toHaveBeenCalled()
    })
  })

  describe('GET /check/me', () => {
    it('returns user checks', async () => {
      const app = await makeApp((app) => {
        app.use('*', async (c, next) => {
          c.set('user', { id: 'user1' })
          await next()
        })
      })

      checkGetByUserIdSpy.mockResolvedValue([{ id: 'c1' }])

      const res = await app.request('/check/me')
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.checks).toHaveLength(1)
    })

    it('returns 404 if no checks found', async () => {
      const app = await makeApp((app) => {
        app.use('*', async (c, next) => {
          c.set('user', { id: 'user1' })
          await next()
        })
      })

      checkGetByUserIdSpy.mockResolvedValue([])

      const res = await app.request('/check/me')
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.checks).toHaveLength(0)
    })
  })

  describe('DELETE /check/delete/:id', () => {
    it('deletes user check', async () => {
      const app = await makeApp((app) => {
        app.use('*', async (c, next) => {
          c.set('user', { id: 'user1' })
          await next()
        })
      })

      checkGetByIdSpy.mockResolvedValue({ id: 'c1', userId: 'user1' })
      checkDeleteSpy.mockResolvedValue({ id: 'c1' })

      const res = await app.request('/check/delete/c1', { method: 'DELETE' })
      expect(res.status).toBe(200)
      expect(checkDeleteSpy).toHaveBeenCalledWith('c1')
    })

    it('returns 404 if check not found or not owned by user', async () => {
      const app = await makeApp((app) => {
        app.use('*', async (c, next) => {
          c.set('user', { id: 'user1' })
          await next()
        })
      })

      checkGetByIdSpy.mockResolvedValue({ id: 'c1', userId: 'otherUser' })

      const res = await app.request('/check/delete/c1', { method: 'DELETE' })
      expect(res.status).toBe(404)
      expect(checkDeleteSpy).not.toHaveBeenCalled()
    })

    it('deletes trigger schedule before deleting check', async () => {
      const app = await makeApp((app) => {
        app.use('*', async (c, next) => {
          c.set('user', { id: 'user1' })
          await next()
        })
      })

      checkGetByIdSpy.mockResolvedValue({
        id: 'c1',
        userId: 'user1',
        triggerScheduleId: 'sched-1',
      })
      checkDeleteSpy.mockResolvedValue({ id: 'c1' })
      schedulesDelSpy.mockResolvedValue({})

      const res = await app.request('/check/delete/c1', { method: 'DELETE' })
      expect(res.status).toBe(200)
      expect(schedulesDelSpy).toHaveBeenCalledWith('sched-1')
      expect(checkDeleteSpy).toHaveBeenCalledWith('c1')
    })
  })

  describe('POST /check/new with workflowId', () => {
    function authMiddleware(app: Hono<AppEnv>) {
      app.use('*', async (c, next) => {
        c.set('user', { id: 'user1' })
        await next()
      })
    }

    it('returns 400 if workflow not found', async () => {
      const app = await makeApp(authMiddleware)

      cityGetByIdSpy.mockResolvedValue({ id: 'MS', name: 'Münster' })
      workflowGetByIdSpy.mockResolvedValue(null)

      const res = await app.request('/check/new', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          city: 'MS',
          letters: 'AB',
          numbers: '123',
          workflowId: 'wf-missing',
        }),
      })

      expect(res.status).toBe(400)
      expect(checkCreateSpy).not.toHaveBeenCalled()
    })

    it('returns 400 if workflow is not published', async () => {
      const app = await makeApp(authMiddleware)

      cityGetByIdSpy.mockResolvedValue({ id: 'MS', name: 'Münster' })
      workflowGetByIdSpy.mockResolvedValue({ id: 'wf-1', isPublished: false })

      const res = await app.request('/check/new', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          city: 'MS',
          letters: 'AB',
          numbers: '123',
          workflowId: 'wf-1',
        }),
      })

      expect(res.status).toBe(400)
      expect(checkCreateSpy).not.toHaveBeenCalled()
    })

    it('creates schedule and runs initial check when workflowId provided', async () => {
      const app = await makeApp(authMiddleware)

      cityGetByIdSpy.mockResolvedValue({ id: 'MS', name: 'Münster' })
      workflowGetByIdSpy.mockResolvedValue({ id: 'wf-1', isPublished: true })
      checkCreateSpy.mockResolvedValue({ id: 'check-1' })
      schedulesCreateSpy.mockResolvedValue({ id: 'sched-1' })
      checkUpdateScheduleIdSpy.mockResolvedValue({})
      executeWorkflowSpy.mockResolvedValue({})

      const res = await app.request('/check/new', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          city: 'MS',
          letters: 'AB',
          numbers: '123',
          workflowId: 'wf-1',
        }),
      })

      expect(res.status).toBe(200)
      expect(schedulesCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          task: 'scheduled-check-execution',
          externalId: 'check-1',
          deduplicationKey: 'check-1',
        })
      )
      expect(checkUpdateScheduleIdSpy).toHaveBeenCalled()
      expect(executeWorkflowSpy).toHaveBeenCalled()
    })
  })

  describe('PUT /check/:id/workflow', () => {
    function authMiddleware(app: Hono<AppEnv>) {
      app.use('*', async (c, next) => {
        c.set('user', { id: 'user1' })
        await next()
      })
    }

    const existingCheck = {
      id: 'c1',
      userId: 'user1',
      workflowId: null,
      cityId: 'MS',
      letters: 'AB',
      numbers: 123,
    }

    it('assigns workflow, creates schedule, and triggers execution', async () => {
      const app = await makeApp(authMiddleware)

      checkGetByIdSpy.mockResolvedValue(existingCheck)
      workflowGetByIdSpy.mockResolvedValue({ id: 'wf-1', isPublished: true })
      checkAssignWorkflowSpy.mockResolvedValue({
        ...existingCheck,
        workflowId: 'wf-1',
      })
      schedulesCreateSpy.mockResolvedValue({ id: 'sched-1' })
      checkUpdateScheduleIdSpy.mockResolvedValue({})
      executeWorkflowSpy.mockResolvedValue({})

      const res = await app.request('/check/c1/workflow', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ workflowId: 'wf-1' }),
      })

      expect(res.status).toBe(200)
      expect(checkAssignWorkflowSpy).toHaveBeenCalledWith('c1', 'wf-1')
      expect(schedulesCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          task: 'scheduled-check-execution',
          externalId: 'c1',
        })
      )
      expect(checkUpdateScheduleIdSpy).toHaveBeenCalled()
      expect(executeWorkflowSpy).toHaveBeenCalled()
    })

    it('returns 404 if check not found', async () => {
      const app = await makeApp(authMiddleware)

      checkGetByIdSpy.mockResolvedValue(null)

      const res = await app.request('/check/c1/workflow', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ workflowId: 'wf-1' }),
      })

      expect(res.status).toBe(404)
    })

    it('returns 400 if check already has a workflow', async () => {
      const app = await makeApp(authMiddleware)

      checkGetByIdSpy.mockResolvedValue({
        ...existingCheck,
        workflowId: 'wf-existing',
      })

      const res = await app.request('/check/c1/workflow', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ workflowId: 'wf-1' }),
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.message).toContain('already has a workflow')
    })

    it('returns 400 if workflow not found', async () => {
      const app = await makeApp(authMiddleware)

      checkGetByIdSpy.mockResolvedValue(existingCheck)
      workflowGetByIdSpy.mockResolvedValue(null)

      const res = await app.request('/check/c1/workflow', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ workflowId: 'wf-missing' }),
      })

      expect(res.status).toBe(400)
    })

    it('returns 400 if workflow is not published', async () => {
      const app = await makeApp(authMiddleware)

      checkGetByIdSpy.mockResolvedValue(existingCheck)
      workflowGetByIdSpy.mockResolvedValue({ id: 'wf-1', isPublished: false })

      const res = await app.request('/check/c1/workflow', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ workflowId: 'wf-1' }),
      })

      expect(res.status).toBe(400)
    })
  })
})
