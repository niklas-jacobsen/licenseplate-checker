import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { ApiResponse } from '@licenseplate-checker/shared/types'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'

class ApiClient {
  private axiosInstance: AxiosInstance

  constructor(baseUrl: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })
  }

  // Generic request method using Axios
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.request<T>({
        method,
        url: endpoint,
        ...config,
      })

      return {
        data: response.data,
        status: response.status,
      }
    } catch (error: any) {
      console.error('API request failed:', error)

      const responseData = error.response?.data
      const backendError = responseData?.error

      let errorMessage = 'Unknown error'
      if (typeof backendError === 'string') {
        errorMessage = backendError
      } else if (backendError?.message) {
        errorMessage = backendError.message
      } else if (error.message) {
        errorMessage = error.message
      }

      return {
        error: errorMessage,
        status: error.response?.status || 500,
      }
    }
  }

  async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, {
      headers: this.authHeader(token),
    })
  }

  async post<T>(
    endpoint: string,
    body: any,
    token?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, {
      data: body,
      headers: this.authHeader(token),
    })
  }

  async put<T>(
    endpoint: string,
    body: any,
    token?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, {
      data: body,
      headers: this.authHeader(token),
    })
  }

  async delete<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, {
      headers: this.authHeader(token),
    })
  }

  authHeader(token?: string): Record<string, string> {
    const finalToken = token || localStorage.getItem('token')
    return finalToken ? { Authorization: `Bearer ${finalToken}` } : {}
  }
}

const apiClient = new ApiClient()
export default apiClient
