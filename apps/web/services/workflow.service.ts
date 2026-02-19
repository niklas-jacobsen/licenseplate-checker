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
}

export const workflowService = {
  async getPublishedByCity(cityId: string) {
    return apiClient.get<{ workflows: PublishedWorkflow[] }>(
      `/builder/workflows?cityId=${encodeURIComponent(cityId)}`
    )
  },

  async getMyWorkflows() {
    return apiClient.get<{ workflows: Workflow[] }>('/builder/my-workflows')
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
}
