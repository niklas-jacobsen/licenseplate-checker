import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { render, screen, waitFor } from '@testing-library/react'

mock.module('next/link', () => ({
  default: ({
    href,
    children,
  }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import { AuthProvider } from '../../components/auth-context'
import AuthStatus from '../../components/auth-status'

function createMockApiClient() {
  return { setAuthErrorHandler: mock() }
}

function createMockUserService(getMeResult: unknown) {
  return {
    getMe: mock(() => Promise.resolve(getMeResult)),
    login: mock(),
    register: mock(),
    updateMe: mock(),
  }
}

function renderAuthStatus(getMeResult: unknown, withToken = false) {
  if (withToken) localStorage.setItem('token', 'test-token')
  return render(
    <AuthProvider
      userService={createMockUserService(getMeResult) as any}
      apiClient={createMockApiClient() as any}
    >
      <AuthStatus />
    </AuthProvider>
  )
}

describe('AuthStatus', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('renders loading skeleton when isLoading is true', () => {
    const userService = {
      getMe: mock(() => new Promise(() => undefined)),
      login: mock(),
      register: mock(),
      updateMe: mock(),
    }
    localStorage.setItem('token', 'test-token')
    const { container } = render(
      <AuthProvider
        userService={userService as any}
        apiClient={createMockApiClient() as any}
      >
        <AuthStatus />
      </AuthProvider>
    )

    const skeleton = container.querySelector('.animate-pulse')
    expect(skeleton).not.toBeNull()
    expect(screen.queryByText('Log In')).not.toBeInTheDocument()
  })

  it('renders Log In and Sign Up links when not authenticated', async () => {
    renderAuthStatus({ data: null })

    await waitFor(() => {
      expect(screen.getByText('Log In')).toBeInTheDocument()
    })

    const logIn = screen.getByText('Log In')
    expect(logIn.closest('a')).toHaveAttribute('href', '/auth/login')

    const signUp = screen.getByText('Sign Up')
    expect(signUp.closest('a')).toHaveAttribute('href', '/auth/register')
  })

  it('renders avatar with first letter of email when authenticated', async () => {
    renderAuthStatus({ data: { email: 'peter@example.com' } }, true)

    await waitFor(() => {
      expect(screen.getByText('P')).toBeInTheDocument()
    })
  })

  it('renders "?" when email is missing', async () => {
    renderAuthStatus({ data: { email: '' } }, true)

    await waitFor(() => {
      expect(screen.getByText('?')).toBeInTheDocument()
    })
  })

  it('does not show Log In or Sign Up when authenticated', async () => {
    renderAuthStatus({ data: { email: 'bob@test.com' } }, true)

    await waitFor(() => {
      expect(screen.getByText('B')).toBeInTheDocument()
    })

    expect(screen.queryByText('Log In')).not.toBeInTheDocument()
    expect(screen.queryByText('Sign Up')).not.toBeInTheDocument()
  })
})
