import apiClient from '../lib/api-client'
import { zCheckRequestScheme } from '@licenseplate-checker/shared/validators'
import type { LicensePlateCheck } from '@licenseplate-checker/shared/types'
import { z } from 'zod'

export type CreateCheckData = z.infer<typeof zCheckRequestScheme>

export const checkService = {
  async createCheck(data: CreateCheckData) {
    return apiClient.post('/request/new', data)
  },

  async getChecks(signal?: AbortSignal) {
    return apiClient.get<{ checks: any[] }>('/request/me', undefined, { signal })
  },

  async assignWorkflow(checkId: string, workflowId: string) {
    return apiClient.put<{ check: LicensePlateCheck }>(`/request/${checkId}/workflow`, { workflowId })
  },

  async deleteCheck(id: string) {
    return apiClient.delete(`/request/delete/${id}`)
  }
}
