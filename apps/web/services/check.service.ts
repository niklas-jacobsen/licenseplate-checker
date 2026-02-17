import apiClient from '../lib/api-client'
import { zRequestScheme } from '@licenseplate-checker/shared/validators'
import { z } from 'zod'

export type CreateCheckData = z.infer<typeof zRequestScheme>

export const checkService = {
  async createCheck(data: CreateCheckData) {
    return apiClient.post('/request/new', data)
  },

  async getChecks() {
    return apiClient.get<{ checks: any[] }>('/request/me')
  },

  async deleteCheck(id: string) {
    return apiClient.delete(`/request/delete/${id}`)
  }
}
