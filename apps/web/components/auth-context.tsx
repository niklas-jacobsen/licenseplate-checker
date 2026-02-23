'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import defaultApiClient from '../lib/api-client'
import {
  userService as defaultUserService,
  type User,
} from '@/services/user.service'

type UserService = typeof defaultUserService
type ApiClient = typeof defaultApiClient

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signUp: (email: string, password: string) => Promise<void>
  logIn: (email: string, password: string) => Promise<void>
  updateUser: (data: Partial<User>) => Promise<void>
  logOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
  userService?: UserService
  apiClient?: ApiClient
}

export function AuthProvider({
  children,
  userService = defaultUserService,
  apiClient = defaultApiClient,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // auto log out on 401s
    apiClient.setAuthErrorHandler(() => setUser(null))
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setUser(null)
        setIsLoading(false)
        return
      }

      const response = await userService.getMe(token)

      if (response.data) {
        setUser(response.data)
      } else if (response.status === 401) {
        setUser(null)
      }

      setIsLoading(false)
    }

    fetchUser()
  }, [])

  const signUp = async (email: string, password: string) => {
    const response = await userService.register(email, password)

    if (response.data?.token) {
      localStorage.setItem('token', response.data.token)
      const userResponse = await userService.getMe()
      if (userResponse.data) {
        setUser(userResponse.data)
      }
    } else {
      throw new Error(response.error || 'Failed to sign up')
    }
  }

  const logIn = async (email: string, password: string) => {
    const response = await userService.login(email, password)

    if (response.data?.token) {
      localStorage.setItem('token', response.data.token)
      const userResponse = await userService.getMe()
      if (userResponse.data) {
        setUser(userResponse.data)
      }
    } else {
      throw new Error(response.error || 'Failed to log in')
    }
  }

  const logOut = async () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const updateUser = async (updatedFields: Partial<User>) => {
    const response = await userService.updateMe(updatedFields)

    if (response.data) {
      setUser(response.data)
    } else {
      throw new Error(response.error || 'Failed to update profile')
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signUp, logIn, logOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
