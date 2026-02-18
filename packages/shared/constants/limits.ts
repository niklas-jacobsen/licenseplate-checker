// This file exports constants that define limits for the application.

// Builder
export const BUILDER_MAX_NODES_PER_GRAPH = 50
export const BUILDER_MAX_WORKFLOWS_PER_USER = 10

// Executor
export const EXECUTOR_ACTION_DELAY_MS = 800

// Trigger Workers
export const TRIGGER_WORKER_CONCURRENCY_LIMIT = 5
export const TRIGGER_WORKER_MAX_DURATION = 120

// Trigger Retry
export const TRIGGER_WORKER_RETRY_MAX_ATTEMPTS = 2
export const TRIGGER_WORKER_RETRY_FACTOR = 1.8
export const TRIGGER_WORKER_RETRY_MIN_TIMEOUT_MS = 1000
export const TRIGGER_WORKER_RETRY_MAX_TIMEOUT_MS = 30_000