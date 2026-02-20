import apiClient from '../lib/api-client'

interface PublishedWorkflow {
  id: string
  name: string
  description: string | null
  cityId: string
}

interface Workflow {
  id: string
  name: string
  description: string | null
  cityId: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
  city: { name: string }
  executions: {
    id: string
    status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED'
    startedAt: string
    finishedAt?: string | null
    duration?: number
  }[]
}

export const workflowService = {
  async getPublishedByCity(cityId: string) {
    return apiClient.get<{ workflows: PublishedWorkflow[] }>(
      `/builder/workflows?cityId=${encodeURIComponent(cityId)}`
    )
  },

  async getMyWorkflows(signal?: AbortSignal) {
    return apiClient.get<{ workflows: Workflow[] }>('/builder/my-workflows', undefined, { signal })
  },

  async publish(id: string, isPublished: boolean) {
    return apiClient.put<{ workflow: Workflow }>(
      `/builder/workflow/${id}/publish`,
      { isPublished }
    )
  },

  async deleteWorkflow(id: string) {
    return apiClient.delete<{ message: string }>(`/builder/workflow/${id}`)
  },

  async create(data: {
    name: string
    cityId: string
    definition: unknown
    description?: string
  }) {
    return apiClient.post<{ workflow: Workflow }>('/builder/workflow', data)
  },

  async getById(id: string) {
    return apiClient.get<{
      workflow: Workflow & {
        definition: unknown
        author: { email: string; firstname: string; lastname: string }
      }
    }>(`/builder/workflow/${id}`)
  },

  async updateDefinition(id: string, definition: unknown) {
    return apiClient.put<{ workflow: Workflow }>(`/builder/workflow/${id}`, {
      definition,
    })
  },

  async update(
    id: string,
    data: {
      name?: string
      description?: string
      definition?: unknown
    }
  ) {
    return apiClient.put<{ workflow: Workflow }>(
      `/builder/workflow/${id}`,
      data
    )
  },

  async testExecute(workflowId: string, variables?: Record<string, string>) {
    return apiClient.post<{
      executionId: string
      triggerRunId: string
      testsRemaining: number
    }>('/builder/test-execute', { workflowId, variables })
  },

  async getExecution(executionId: string) {
    return apiClient.get<{
      execution: {
        id: string
        status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED'
        logs: unknown[] | null
        errorNodeId: string | null
        result: { error?: string; success?: boolean } | null
        currentNodeId: string | null
        completedNodes:
          | { nodeId: string; status: string }[]
          | null
        startedAt: string
        finishedAt: string | null
        duration: number | null
      }
    }>(`/builder/execution/${executionId}`)
  },
}
