import { defineConfig } from "@trigger.dev/sdk/v3"
import { playwright } from "@trigger.dev/build/extensions/playwright"
import {
  TRIGGER_WORKER_MAX_DURATION,
  TRIGGER_WORKER_RETRY_MAX_ATTEMPTS,
  TRIGGER_WORKER_RETRY_MIN_TIMEOUT_MS,
  TRIGGER_WORKER_RETRY_MAX_TIMEOUT_MS,
  TRIGGER_WORKER_RETRY_FACTOR
} from "@licenseplate-checker/shared/constants/limits"

export default defineConfig({
  project: "proj_hibdgwjppipkfehhmcfu",
  runtime: "node",
  logLevel: "log",
  // The max compute seconds a task is allowed to run. If the task run exceeds this duration, it will be stopped.
  // You can override this on an individual task.
  // See https://trigger.dev/docs/runs/max-duration
  maxDuration: TRIGGER_WORKER_MAX_DURATION,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: TRIGGER_WORKER_RETRY_MAX_ATTEMPTS,
      minTimeoutInMs: TRIGGER_WORKER_RETRY_MIN_TIMEOUT_MS,
      maxTimeoutInMs: TRIGGER_WORKER_RETRY_MAX_TIMEOUT_MS,
      factor: TRIGGER_WORKER_RETRY_FACTOR,
      randomize: true,
    },
  },
  dirs: ["./src/trigger"],
  build: {
    external: ["playwright", "playwright-core", "chromium-bidi"],
    extensions: [
      playwright({ browsers: ["chromium"] }),
    ],
  },
})
