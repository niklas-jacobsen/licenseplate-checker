// User types
export interface User {
  id: string
  name: string
  email: string
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  status: number
}

// Authentication types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}

// Error types
export interface Error<T = Record<string, unknown>> {
  code: string
  message: string
  details?: T
}
