import { describe, expect, it, mock } from 'bun:test'
import { render, screen } from '@testing-library/react'

const useAuthMock = mock()

mock.module('../../lib/auth-context', () => ({
  useAuth: useAuthMock,
}))

mock.module('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import AuthStatus from '@/components/auth-status'

describe('AuthStatus', () => {
  it('renders loading skeleton when isLoading is true', () => {
    useAuthMock.mockReturnValue({ user: null, isLoading: true, logOut: mock() })
    const { container } = render(<AuthStatus />)

    const skeleton = container.querySelector('.animate-pulse')
    expect(skeleton).not.toBeNull()
    expect(screen.queryByText('Log In')).not.toBeInTheDocument()
  })

  it('renders Log In and Sign Up links when not authenticated', () => {
    useAuthMock.mockReturnValue({ user: null, isLoading: false, logOut: mock() })
    render(<AuthStatus />)

    const logIn = screen.getByText('Log In')
    expect(logIn.closest('a')).toHaveAttribute('href', '/auth/login')

    const signUp = screen.getByText('Sign Up')
    expect(signUp.closest('a')).toHaveAttribute('href', '/auth/register')
  })

  it('renders avatar with first letter of email when authenticated', () => {
    useAuthMock.mockReturnValue({
      user: { email: 'alice@example.com' },
      isLoading: false,
      logOut: mock(),
    })
    render(<AuthStatus />)

    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('renders "?" when email is missing', () => {
    useAuthMock.mockReturnValue({
      user: { email: '' },
      isLoading: false,
      logOut: mock(),
    })
    render(<AuthStatus />)

    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('does not show Log In or Sign Up when authenticated', () => {
    useAuthMock.mockReturnValue({
      user: { email: 'bob@test.com' },
      isLoading: false,
      logOut: mock(),
    })
    render(<AuthStatus />)

    expect(screen.queryByText('Log In')).not.toBeInTheDocument()
    expect(screen.queryByText('Sign Up')).not.toBeInTheDocument()
  })
})
