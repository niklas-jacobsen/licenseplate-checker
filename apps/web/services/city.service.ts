import apiClient from '../lib/api-client'

export interface City {
  id: string
  name: string
  allowedDomains: string[]
}

export const cityService = {
  async getCities(signal?: AbortSignal) {
    return apiClient.get<{ cities: City[] }>('/cities', undefined, { signal })
  },
}
