import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../components/auth-context'

const MOCK_USER = { id: '1', email: 'peter@example.com' }

function createMockUserService() {
  return {
    getMe: mock(),
    login: mock(),
    register: mock(),
    updateMe: mock(),
  }
}

function createMockApiClient() {
  return {
    setAuthErrorHandler: mock(),
  }
}

// context consumer component  for testing
function TestConsumer({
  onAuth,
}: {
  onAuth: (ctx: ReturnType<typeof useAuth>) => void
}) {
  const auth = useAuth()
  onAuth(auth)
  return (
    <div>
      <span data-testid="loading">{String(auth.isLoading)}</span>
      <span data-testid="email">{auth.user?.email ?? 'none'}</span>
      <button
        type="button"
        data-testid="login"
        onClick={() => auth.logIn('a@b.com', 'pass')}
      >
        login
      </button>
      <button
        type="button"
        data-testid="signup"
        onClick={() => auth.signUp('a@b.com', 'pass')}
      >
        signup
      </button>
      <button type="button" data-testid="logout" onClick={() => auth.logOut()}>
        logout
      </button>
      <button
        type="button"
        data-testid="update"
        onClick={() => auth.updateUser({ firstname: 'Bob' })}
      >
        update
      </button>
    </div>
  )
}

function renderWithProvider(
  userService = createMockUserService(),
  apiClient = createMockApiClient()
) {
  let authRef: ReturnType<typeof useAuth> | undefined
  const onAuth = (ctx: ReturnType<typeof useAuth>) => {
    authRef = ctx
  }
  const result = render(
    <AuthProvider userService={userService as any} apiClient={apiClient as any}>
      <TestConsumer onAuth={onAuth} />
    </AuthProvider>
  )
  return { ...result, getAuth: () => authRef!, userService, apiClient }
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('registers auth error handler on mount', async () => {
    const { apiClient } = renderWithProvider()
    await waitFor(() =>
      expect(apiClient.setAuthErrorHandler).toHaveBeenCalledTimes(1)
    )
  })

  it('sets isLoading false and user null when no token in localStorage', async () => {
    const userService = createMockUserService()
    userService.getMe.mockResolvedValue({ data: null })

    renderWithProvider(userService)

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
      expect(screen.getByTestId('email').textContent).toBe('none')
    })
  })

  it('fetches user when token exists in localStorage', async () => {
    localStorage.setItem('token', 'stored-token')
    const userService = createMockUserService()
    userService.getMe.mockResolvedValue({ data: MOCK_USER })

    renderWithProvider(userService)

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
      expect(screen.getByTestId('email').textContent).toBe('peter@example.com')
    })
    expect(userService.getMe).toHaveBeenCalledWith('stored-token')
  })

  it('clears user on 401 during initial fetch', async () => {
    localStorage.setItem('token', 'expired-token')
    const userService = createMockUserService()
    userService.getMe.mockResolvedValue({ data: null, status: 401 })

    renderWithProvider(userService)

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
      expect(screen.getByTestId('email').textContent).toBe('none')
    })
  })

  it('logIn stores token, fetches user, and updates state', async () => {
    const userService = createMockUserService()
    userService.getMe.mockResolvedValue({ data: null })
    userService.login.mockResolvedValue({ data: { token: 'new-token' } })

    renderWithProvider(userService)

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    )

    userService.getMe.mockResolvedValue({ data: MOCK_USER })

    await act(async () => {
      fireEvent.click(screen.getByTestId('login'))
    })

    expect(userService.login).toHaveBeenCalledWith('a@b.com', 'pass')
    expect(localStorage.getItem('token')).toBe('new-token')
    await waitFor(() =>
      expect(screen.getByTestId('email').textContent).toBe('peter@example.com')
    )
  })

  it('logIn throws when API returns error', async () => {
    const userService = createMockUserService()
    userService.getMe.mockResolvedValue({ data: null })
    userService.login.mockResolvedValue({ error: 'Invalid credentials' })

    const { getAuth } = renderWithProvider(userService)

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    )

    await expect(getAuth().logIn('a@b.com', 'bad')).rejects.toThrow(
      'Invalid credentials'
    )
  })

  it('signUp stores token, fetches user, and updates state', async () => {
    const userService = createMockUserService()
    userService.getMe.mockResolvedValue({ data: null })
    userService.register.mockResolvedValue({ data: { token: 'signup-token' } })

    renderWithProvider(userService)

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    )

    userService.getMe.mockResolvedValue({ data: MOCK_USER })

    await act(async () => {
      fireEvent.click(screen.getByTestId('signup'))
    })

    expect(userService.register).toHaveBeenCalledWith('a@b.com', 'pass')
    expect(localStorage.getItem('token')).toBe('signup-token')
    await waitFor(() =>
      expect(screen.getByTestId('email').textContent).toBe('peter@example.com')
    )
  })

  it('signUp throws when API returns error', async () => {
    const userService = createMockUserService()
    userService.getMe.mockResolvedValue({ data: null })
    userService.register.mockResolvedValue({ error: 'Email taken' })

    const { getAuth } = renderWithProvider(userService)

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    )

    await expect(getAuth().signUp('a@b.com', 'pass')).rejects.toThrow(
      'Email taken'
    )
  })

  it('logOut removes token and clears user', async () => {
    localStorage.setItem('token', 'stored-token')
    const userService = createMockUserService()
    userService.getMe.mockResolvedValue({ data: MOCK_USER })

    renderWithProvider(userService)

    await waitFor(() =>
      expect(screen.getByTestId('email').textContent).toBe('peter@example.com')
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId('logout'))
    })

    expect(localStorage.getItem('token')).toBeNull()
    expect(screen.getByTestId('email').textContent).toBe('none')
  })

  it('updateUser calls service and updates state', async () => {
    localStorage.setItem('token', 'stored-token')
    const userService = createMockUserService()
    userService.getMe.mockResolvedValue({ data: MOCK_USER })
    userService.updateMe.mockResolvedValue({
      data: { ...MOCK_USER, firstname: 'Bob' },
    })

    renderWithProvider(userService)

    await waitFor(() =>
      expect(screen.getByTestId('email').textContent).toBe('peter@example.com')
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId('update'))
    })

    expect(userService.updateMe).toHaveBeenCalledWith({ firstname: 'Bob' })
  })

  it('updateUser throws when API returns error', async () => {
    const userService = createMockUserService()
    userService.getMe.mockResolvedValue({ data: null })
    userService.updateMe.mockResolvedValue({ error: 'Forbidden' })

    const { getAuth } = renderWithProvider(userService)

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    )

    await expect(getAuth().updateUser({ firstname: 'X' })).rejects.toThrow(
      'Forbidden'
    )
  })
})
