import { schedules, logger } from "@trigger.dev/sdk/v3"

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080"
const INTERNAL_SECRET = process.env.TRIGGER_WEBHOOK_SECRET || "dev-webhook-secret"

export const scheduledCheckExecution = schedules.task({
  id: "scheduled-check-execution",
  run: async (payload) => {
    const checkId = payload.externalId

    if (!checkId) {
      logger.error("Scheduled check execution missing externalId")
      return
    }

    logger.info("Triggering scheduled check execution", {
      checkId,
      scheduleId: payload.scheduleId,
      scheduledAt: payload.timestamp,
    })

    const response = await fetch(`${API_BASE_URL}/internal/execute-check/${checkId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": INTERNAL_SECRET,
      },
    })

    if (!response.ok) {
      const body = await response.text()
      logger.error("Failed to trigger check execution", {
        checkId,
        status: response.status,
        body,
      })
      throw new Error(`Internal execute-check failed: ${response.status}`)
    }

    const result = await response.json()
    logger.info("Check execution triggered successfully", { checkId, result })

    return result
  },
})
