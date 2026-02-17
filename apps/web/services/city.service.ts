import apiClient from '../lib/api-client'

export const cityService = {
  async getCities() {
    return apiClient.get<{ cities: { id: string; name: string }[] }>('/cities')
  },
}
