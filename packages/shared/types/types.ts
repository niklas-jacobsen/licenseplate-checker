export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  status: number
}

export interface LicensePlateCheck {
  id: string
  cityId: string
  letters: string
  numbers: number
  userId: string
  status: string
  createdAt: string
  updatedAt: string
  lastCheckedAt?: string
  workflowId?: string
}
