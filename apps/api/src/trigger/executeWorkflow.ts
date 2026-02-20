import { task, logger } from "@trigger.dev/sdk/v3"
import {
  TRIGGER_WORKER_CONCURRENCY_LIMIT,
  TRIGGER_WORKER_RETRY_MAX_ATTEMPTS,
  TRIGGER_WORKER_RETRY_MIN_TIMEOUT_MS,
  TRIGGER_WORKER_RETRY_MAX_TIMEOUT_MS,
  TRIGGER_WORKER_RETRY_FACTOR
} from '@licenseplate-checker/shared/constants/limits'
import { IrExecutor } from '../builder/executor/IrExecutor'
import type { BuilderIr } from '@shared/builder-ir'
import type { VariableContext } from '@licenseplate-checker/shared/template-variables'

interface ExecuteWorkflowPayload {
  ir: BuilderIr
  executionId: string
  callbackUrl: string
  callbackSecret: string
  allowedDomains: string[]
  variables?: VariableContext
  websiteUrl?: string
}

async function reportProgress(
  callbackUrl: string,
  callbackSecret: string,
  executionId: string,
  currentNodeId: string | null,
  completedNodes: { nodeId: string; status: 'success' | 'error' }[],
) {
  try {
    await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': callbackSecret,
      },
      body: JSON.stringify({
        type: 'progress',
        executionId,
        currentNodeId,
        completedNodes,
      }),
    })
  } catch (err) {
    logger.warn("Failed to report progress", {
      executionId,
      error: err instanceof Error ? err.message : String(err),
    })
  }
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

    const completedNodes: { nodeId: string; status: 'success' | 'error' }[] = []

    const executor = new IrExecutor({
      allowedDomains,
      variables: payload.variables,
      websiteUrl: payload.websiteUrl,
      onBlockStart: async (sourceNodeId: string) => {
        await reportProgress(callbackUrl, callbackSecret, executionId, sourceNodeId, completedNodes)
      },
      onBlockComplete: async (sourceNodeId: string, success: boolean) => {
        completedNodes.push({ nodeId: sourceNodeId, status: success ? 'success' : 'error' })
        await reportProgress(callbackUrl, callbackSecret, executionId, null, completedNodes)
      },
    })

    const result = await executor.execute(ir)
    const duration = Date.now() - startTime

    const callbackPayload = {
      type: 'completion' as const,
      executionId,
      status: result.success ? 'SUCCESS' : 'FAILED',
      logs: result.logs,
      error: result.error,
      errorNodeId: result.errorNodeId,
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
