export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  status: number
  errorDetails?: unknown
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
  city: {
    name: string
    region?: string
  }
  workflow?: {
    id: string
    name: string
  }
  executions?: {
    id: string
    status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED'
    startedAt: string
    finishedAt?: string | null
  }[]
}
