import { describe, expect, it, mock, beforeEach } from 'bun:test'
import {
  BadRequestError,
  InternalServerError,
} from '@licenseplate-checker/shared/types'

const mockCompileGraphToIr = mock(() => ({
  entryBlockId: 'start',
  blocks: {},
}))

mock.module('../builder/compiler/GraphToIrCompiler', () => ({
  compileGraphToIr: mockCompileGraphToIr,
}))

const mockTasksTrigger = mock()

mock.module('@trigger.dev/sdk/v3', () => ({
  tasks: { trigger: mockTasksTrigger },
}))

mock.module('../env', () => ({
  ENV: {
    API_BASE_URL: 'http://localhost:8080',
    TRIGGER_WEBHOOK_SECRET: 'test-secret',
  },
}))

import {
  buildVariableContext,
  executeWorkflowForCheck,
} from './executeWorkflowForCheck'
import { CompileError } from '../types/compiler.types'

const mockWorkflowController = {
  getById: mock(),
  createExecution: mock(),
  updateExecution: mock(),
} as any

const publishedWorkflow = {
  id: 'wf-1',
  isPublished: true,
  definition: { nodes: [], edges: [] },
  city: {
    name: 'Münster',
    websiteUrl: 'https://www.stadt-muenster.de/wkz/?LICENSEIDENTIFIER=ms',
    allowedDomains: ['stadt-muenster.de'],
  },
}

const unpublishedWorkflow = {
  ...publishedWorkflow,
  isPublished: false,
}

describe('buildVariableContext', () => {
  it('returns correct plate variable context', () => {
    const ctx = buildVariableContext({
      cityId: 'MS',
      letters: 'AB',
      numbers: 123,
    })
    expect(ctx).toEqual({
      'plate.letters': 'AB',
      'plate.numbers': '123',
      'plate.cityId': 'MS',
      'plate.fullPlate': 'MS AB 123',
    })
  })
})

describe('executeWorkflowForCheck', () => {
  beforeEach(() => {
    mockWorkflowController.getById.mockReset()
    mockWorkflowController.createExecution.mockReset()
    mockWorkflowController.updateExecution.mockReset()
    mockCompileGraphToIr.mockClear()
    mockTasksTrigger.mockReset()
  })

  it('throws WORKFLOW_NOT_FOUND when workflow does not exist', async () => {
    mockWorkflowController.getById.mockResolvedValue(null)

    await expect(
      executeWorkflowForCheck(mockWorkflowController, 'nonexistent')
    ).rejects.toThrow(BadRequestError)

    try {
      await executeWorkflowForCheck(mockWorkflowController, 'nonexistent')
    } catch (err: any) {
      expect(err.code).toBe('WORKFLOW_NOT_FOUND')
    }
  })

  it('throws WORKFLOW_NOT_PUBLISHED when workflow is not published', async () => {
    mockWorkflowController.getById.mockResolvedValue(unpublishedWorkflow)

    try {
      await executeWorkflowForCheck(mockWorkflowController, 'wf-1')
    } catch (err: any) {
      expect(err).toBeInstanceOf(BadRequestError)
      expect(err.code).toBe('WORKFLOW_NOT_PUBLISHED')
    }
  })

  it('skips publish check when skipPublishCheck is true', async () => {
    mockWorkflowController.getById.mockResolvedValue(unpublishedWorkflow)
    mockWorkflowController.createExecution.mockResolvedValue({ id: 'exec-1' })
    mockTasksTrigger.mockResolvedValue({ id: 'run-1' })
    mockWorkflowController.updateExecution.mockResolvedValue({})

    const result = await executeWorkflowForCheck(
      mockWorkflowController,
      'wf-1',
      undefined,
      { skipPublishCheck: true }
    )

    expect(result.executionId).toBe('exec-1')
  })

  it('compiles, creates execution, triggers task, and updates status on success', async () => {
    mockWorkflowController.getById.mockResolvedValue(publishedWorkflow)
    mockWorkflowController.createExecution.mockResolvedValue({ id: 'exec-1' })
    mockTasksTrigger.mockResolvedValue({ id: 'run-abc' })
    mockWorkflowController.updateExecution.mockResolvedValue({})

    const result = await executeWorkflowForCheck(
      mockWorkflowController,
      'wf-1',
      'check-1',
      { variables: { 'plate.letters': 'AB' } }
    )

    expect(result).toEqual({ executionId: 'exec-1', triggerRunId: 'run-abc' })

    expect(mockCompileGraphToIr).toHaveBeenCalledWith(
      publishedWorkflow.definition
    )
    expect(mockWorkflowController.createExecution).toHaveBeenCalledWith(
      'wf-1',
      'check-1'
    )

    expect(mockTasksTrigger).toHaveBeenCalledWith(
      'execute-workflow',
      expect.objectContaining({
        executionId: 'exec-1',
        callbackUrl: 'http://localhost:8080/webhooks/trigger',
        callbackSecret: 'test-secret',
        allowedDomains: ['stadt-muenster.de'],
        cityName: 'Münster',
        variables: { 'plate.letters': 'AB' },
        websiteUrl: 'https://www.stadt-muenster.de/wkz/?LICENSEIDENTIFIER=ms',
      }),
      { idempotencyKey: 'exec-1' }
    )

    expect(mockWorkflowController.updateExecution).toHaveBeenCalledWith(
      'exec-1',
      {
        triggerRunId: 'run-abc',
        status: 'RUNNING',
      }
    )
  })

  it('re-throws CompileError', async () => {
    mockWorkflowController.getById.mockResolvedValue(publishedWorkflow)
    mockCompileGraphToIr.mockImplementation(() => {
      throw new CompileError('Compile failed', [
        { type: 'graph.parse', message: 'bad graph' },
      ])
    })

    await expect(
      executeWorkflowForCheck(mockWorkflowController, 'wf-1')
    ).rejects.toBeInstanceOf(CompileError)
  })

  it('wraps unknown trigger errors in InternalServerError', async () => {
    mockWorkflowController.getById.mockResolvedValue(publishedWorkflow)
    mockCompileGraphToIr.mockReturnValue({ entryBlockId: 'start', blocks: {} })
    mockWorkflowController.createExecution.mockResolvedValue({ id: 'exec-1' })
    mockTasksTrigger.mockRejectedValue(
      new Error('Trigger.dev connection failed')
    )

    try {
      await executeWorkflowForCheck(mockWorkflowController, 'wf-1')
    } catch (err: any) {
      expect(err).toBeInstanceOf(InternalServerError)
      expect(err.code).toBe('EXECUTION_TRIGGER_ERROR')
      expect(err.message).toBe('Trigger.dev connection failed')
    }
  })
})
