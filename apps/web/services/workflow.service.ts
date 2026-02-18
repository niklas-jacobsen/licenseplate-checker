import apiClient from '../lib/api-client'

interface PublishedWorkflow {
  id: string
  name: string
  description: string | null
  cityId: string
}

export const workflowService = {
  async getPublishedByCity(cityId: string) {
    return apiClient.get<{ workflows: PublishedWorkflow[] }>(
      `/builder/workflows?cityId=${encodeURIComponent(cityId)}`
    )
  },
}
