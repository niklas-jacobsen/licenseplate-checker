import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import { ApiResponse } from '@licenseplate-checker/shared/types'
import {
  API_CALL_MAX_RETRIES,
  API_CALL_RETRY_DELAY_MS,
} from '@licenseplate-checker/shared/constants/limits'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'

class ApiClient {
  private axiosInstance: AxiosInstance
  private onAuthError: (() => void) | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
      timeout: 15000,
    })

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          this.onAuthError?.()
        }
        return Promise.reject(error)
      }
    )
  }

  // register callback trigger on 401 to clear the user state
  setAuthErrorHandler(handler: () => void) {
    this.onAuthError = handler
  }

  private isNetworkError(error: AxiosError): boolean {
    return (
      !error.response && error.code !== 'ECONNABORTED' && !axios.isCancel(error)
    )
  }

  private async requestWithRetry<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    let lastError: AxiosError | undefined

    for (let attempt = 0; attempt <= API_CALL_MAX_RETRIES; attempt++) {
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
      } catch (error) {
        lastError = error as AxiosError

        // never retry or log cancelled requests
        if (axios.isCancel(lastError) || lastError.code === 'ERR_CANCELED') {
          return { error: 'Request cancelled', status: 0 }
        }

        // only retry when no response received
        const shouldRetry =
          attempt < API_CALL_MAX_RETRIES && this.isNetworkError(lastError)
        if (shouldRetry) {
          await new Promise((r) =>
            setTimeout(r, API_CALL_RETRY_DELAY_MS * (attempt + 1))
          )
          continue
        }

        break
      }
    }

    const error = lastError!
    const status = error.response?.status ?? 0
    if (this.isNetworkError(error)) {
      console.warn('API unreachable:', endpoint)
    } else if (status >= 500) {
      console.error('API request failed:', error.message)
    }

    const responseData = error.response?.data as
      | Record<string, unknown>
      | undefined
    const backendError = responseData?.error

    let errorMessage = 'Unknown error'
    if (typeof backendError === 'string') {
      errorMessage = backendError
    } else if (
      backendError &&
      typeof backendError === 'object' &&
      'message' in backendError
    ) {
      errorMessage = (backendError as { message: string }).message
    } else if (this.isNetworkError(error)) {
      errorMessage = 'Network error — please check your connection'
    } else if (error.message) {
      errorMessage = error.message
    }

    return {
      error: errorMessage,
      status: error.response?.status || 0,
    }
  }

  async get<T>(
    endpoint: string,
    token?: string,
    options?: { signal?: AbortSignal }
  ): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>('GET', endpoint, {
      headers: this.authHeader(token),
      signal: options?.signal,
    })
  }

  async post<T>(
    endpoint: string,
    body: unknown,
    token?: string,
    options?: { signal?: AbortSignal }
  ): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>('POST', endpoint, {
      data: body,
      headers: this.authHeader(token),
      signal: options?.signal,
    })
  }

  async put<T>(
    endpoint: string,
    body: unknown,
    token?: string,
    options?: { signal?: AbortSignal }
  ): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>('PUT', endpoint, {
      data: body,
      headers: this.authHeader(token),
      signal: options?.signal,
    })
  }

  async delete<T>(
    endpoint: string,
    token?: string,
    options?: { signal?: AbortSignal }
  ): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>('DELETE', endpoint, {
      headers: this.authHeader(token),
      signal: options?.signal,
    })
  }

  authHeader(token?: string): Record<string, string> {
    const finalToken = token || localStorage.getItem('token')
    return finalToken ? { Authorization: `Bearer ${finalToken}` } : {}
  }
}

const apiClient = new ApiClient()
export default apiClient
