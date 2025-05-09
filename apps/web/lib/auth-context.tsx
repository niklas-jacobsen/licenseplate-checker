'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import apiClient from './api-client'

interface User {
  id: string
  email: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signUp: (email: string, password: string) => Promise<void>
  logIn: (email: string, password: string) => Promise<void>
  logOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Attempt to fetch the current authenticated user
    try {
      const fetchUser = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
          setUser(null)
          setIsLoading(false)
          return
        }

        const response = await apiClient.get<User>('/user/me', token)

        if (response.data) {
          console.log(response.data)
          setUser(response.data)
        } else {
          setUser(null)
        }

        setIsLoading(false)
      }

      fetchUser()
    } catch (err) {
      console.error(err)
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    const response = await apiClient.post<User>('/auth/register', {
      email,
      password,
    })

    if (response.data) {
      setUser(response.data)
    } else {
      throw new Error(response.error || 'Failed to sign up')
    }
  }

  const logIn = async (email: string, password: string) => {
    const response = await apiClient.post<{
      user: User
      token: string
    }>('/auth/login', {
      email,
      password,
    })

    if (response.data) {
      const { user, token } = response.data

      // Save token to localStorage
      localStorage.setItem('token', token)

      // Set user state
      setUser(user)
    } else {
      throw new Error(response.error || 'Failed to sign in')
    }
  }

  const logOut = async () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signUp, logIn, logOut }}>
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
