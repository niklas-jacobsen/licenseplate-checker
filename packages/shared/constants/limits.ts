// This file exports constants that define limits for the application.

// Frontend UI
export const WORKFLOW_DESCRIPTION_MAX_LENGTH = 200
export const WORKFLOW_NAME_MAX_LENGTH = 20

// Frontend API Calls
export const API_CALL_MAX_RETRIES = 2
export const API_CALL_RETRY_DELAY_MS = 500

// Builder
export const BUILDER_MAX_NODES_PER_GRAPH = 30
export const BUILDER_MAX_WORKFLOWS_PER_USER = 10

// Executor
export const EXECUTOR_ACTION_DELAY_MS = 800
export const BUILDER_TEST_EXECUTIONS_PER_DAY = 50

// Trigger Workers
export const TRIGGER_WORKER_CONCURRENCY_LIMIT = 5
export const TRIGGER_WORKER_MAX_DURATION = 300

// Trigger Retry
export const TRIGGER_WORKER_RETRY_MAX_ATTEMPTS = 3
export const TRIGGER_WORKER_RETRY_FACTOR = 1.8
export const TRIGGER_WORKER_RETRY_MIN_TIMEOUT_MS = 1000
export const TRIGGER_WORKER_RETRY_MAX_TIMEOUT_MS = 30_000
