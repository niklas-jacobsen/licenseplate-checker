import apiClient from '../lib/api-client'

export const cityService = {
  async getCities(signal?: AbortSignal) {
    return apiClient.get<{ cities: { id: string; name: string }[] }>('/cities', undefined, { signal })
  },
}
