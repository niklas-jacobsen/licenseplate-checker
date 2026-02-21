import apiClient from '../lib/api-client'

export interface User {
  id: string
  email: string
  salutation?: string
  firstname?: string
  lastname?: string
  birthdate?: string
  street?: string
  streetNumber?: string
  zipcode?: string
  city?: string
}

export const userService = {
  async register(email: string, password: string) {
    return apiClient.post<{ token: string }>('/auth/register', { email, password })
  },

  async login(email: string, password: string) {
    return apiClient.post<{ token: string }>('/auth/login', { email, password })
  },

  async getMe(token?: string) {
    return apiClient.get<User>('/user/me', token)
  },

  async updateMe(data: Partial<User>) {
    return apiClient.put<User>('/user/me', data)
  },
}
