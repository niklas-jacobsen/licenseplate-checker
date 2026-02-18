import { task, logger, queue } from "@trigger.dev/sdk/v3"
import {
  TRIGGER_WORKER_CONCURRENCY_LIMIT,
  TRIGGER_WORKER_RETRY_MAX_ATTEMPTS,
  TRIGGER_WORKER_RETRY_MIN_TIMEOUT_MS,
  TRIGGER_WORKER_RETRY_MAX_TIMEOUT_MS,
  TRIGGER_WORKER_RETRY_FACTOR
} from '@licenseplate-checker/shared/constants/limits'
import { IrExecutor } from '../builder/executor/IrExecutor'
import type { BuilderIr } from '@shared/builder-ir'

interface ExecuteWorkflowPayload {
  ir: BuilderIr
  executionId: string
  callbackUrl: string
  callbackSecret: string
  allowedDomains: string[]
}

export const executeWorkflow = task({
  id: "execute-workflow",
  queue: {
    concurrencyLimit: TRIGGER_WORKER_CONCURRENCY_LIMIT,
  },
  machine: {
    preset: "small-2x",
  },
  retry: {
    maxAttempts: TRIGGER_WORKER_RETRY_MAX_ATTEMPTS,
    factor: TRIGGER_WORKER_RETRY_FACTOR,
    minTimeoutInMs: TRIGGER_WORKER_RETRY_MIN_TIMEOUT_MS,
    maxTimeoutInMs: TRIGGER_WORKER_RETRY_MAX_TIMEOUT_MS,
  },
  run: async (payload: ExecuteWorkflowPayload) => {
    const { ir, executionId, callbackUrl, callbackSecret, allowedDomains } = payload
    const startTime = Date.now()

    logger.info("Starting workflow execution", { executionId, entryBlockId: ir.entryBlockId })

    const executor = new IrExecutor({ allowedDomains })
    const result = await executor.execute(ir)
    const duration = Date.now() - startTime

    let errorNodeId: string | undefined
    if (!result.success && result.logs.length > 0) {
      const lastDebugLog = result.logs
        .filter(log => log.level === 'debug' && log.message.startsWith('Executing block'))
        .pop()
      if (lastDebugLog?.details && typeof lastDebugLog.details === 'object' && 'kind' in (lastDebugLog.details as any)) {
        errorNodeId = lastDebugLog.message.match(/block (\S+)/)?.[1]
      }
    }

    const callbackPayload = {
      executionId,
      status: result.success ? 'SUCCESS' : 'FAILED',
      logs: result.logs,
      error: result.error,
      errorNodeId,
      duration,
    }

    logger.info("Reporting result to API", { executionId, status: callbackPayload.status, duration })

    const response = await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': callbackSecret,
      },
      body: JSON.stringify(callbackPayload),
    })

    if (!response.ok) {
      logger.error("Failed to report result to API", {
        executionId,
        status: response.status,
        statusText: response.statusText,
      })
      throw new Error(`Callback failed: ${response.status} ${response.statusText}`)
    }

    logger.info("Result reported successfully", { executionId })

    return callbackPayload
  },
})
