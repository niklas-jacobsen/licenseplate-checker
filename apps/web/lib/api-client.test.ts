import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import apiClient from './api-client'

describe('ApiClient', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('authHeader', () => {
    it('returns Authorization header when token is provided', () => {
      expect(apiClient.authHeader('my-token')).toEqual({
        Authorization: 'Bearer my-token',
      })
    })

    it('falls back to localStorage token', () => {
      localStorage.setItem('token', 'stored-token')
      expect(apiClient.authHeader()).toEqual({
        Authorization: 'Bearer stored-token',
      })
    })

    it('prefers explicit token over localStorage', () => {
      localStorage.setItem('token', 'stored-token')
      expect(apiClient.authHeader('explicit-token')).toEqual({
        Authorization: 'Bearer explicit-token',
      })
    })

    it('returns empty object when no token exists', () => {
      expect(apiClient.authHeader()).toEqual({})
    })
  })
})
