import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { render, screen, waitFor } from '@testing-library/react'

const routerPush = mock()

mock.module('next/navigation', () => ({
  useRouter: () => ({ push: routerPush }),
}))

const getChecksMock = mock()
mock.module('../../services/check.service', () => ({
  checkService: { getChecks: getChecksMock, deleteCheck: mock(), assignWorkflow: mock() },
}))

mock.module('../../services/workflow.service', () => ({
  workflowService: { getPublishedByCity: mock() },
}))

import { getNextCheckDate } from '@/components/check-dashboard'
import LicensePlateCheckDashboard from '@/components/check-dashboard'

const CHECK_FIXTURE = {
  id: 'chk-1',
  cityId: 'MS',
  letters: 'AB',
  numbers: 123,
  status: 'AVAILABLE',
  createdAt: '2025-06-01T10:00:00Z',
  lastCheckedAt: '2025-06-02T08:00:00Z',
  city: { name: 'Münster', websiteUrl: 'https://muenster.de' },
  workflow: null,
  executions: [],
  scheduledHour: null,
  scheduledMinute: null,
}

describe('getNextCheckDate', () => {
  it('returns today if the time is still ahead', () => {
    const now = new Date()
    const futureHour = (now.getHours() + 2) % 24
    const result = getNextCheckDate(futureHour, 0)

    if (futureHour > now.getHours()) {
      expect(result.getDate()).toBe(now.getDate())
    }
    expect(result.getHours()).toBe(futureHour)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
  })

  it('returns tomorrow if the time has already passed', () => {
    const now = new Date()
    const pastHour = now.getHours() === 0 ? 0 : now.getHours() - 1
    const result = getNextCheckDate(pastHour, 0)

    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    expect(result.getDate()).toBe(tomorrow.getDate())
    expect(result.getHours()).toBe(pastHour)
  })

  it('sets seconds and milliseconds to zero', () => {
    const result = getNextCheckDate(12, 30)
    expect(result.getSeconds()).toBe(0)
    expect(result.getMilliseconds()).toBe(0)
  })
})

describe('LicensePlateCheckDashboard', () => {
  beforeEach(() => {
    getChecksMock.mockReset()
    routerPush.mockReset()
  })

  it('shows loading spinner initially', () => {
    getChecksMock.mockReturnValue(new Promise(() => undefined))
    render(<LicensePlateCheckDashboard />)

    expect(document.querySelector('.animate-spin')).not.toBeNull()
  })

  it('shows error message when fetch fails', async () => {
    getChecksMock.mockResolvedValue({ error: 'Something went wrong' })
    render(<LicensePlateCheckDashboard />)

    await waitFor(() => {
      expect(
        screen.getByText('An error occurred while fetching requests')
      ).toBeInTheDocument()
    })
  })

  it('shows empty state when no checks exist', async () => {
    getChecksMock.mockResolvedValue({ data: { checks: [] } })
    render(<LicensePlateCheckDashboard />)

    await waitFor(() => {
      expect(screen.getByText('No Requests Yet')).toBeInTheDocument()
    })
    expect(
      screen.getByRole('button', { name: 'Make Your First Request' })
    ).toBeInTheDocument()
  })

  it('renders check cards with status badge', async () => {
    getChecksMock.mockResolvedValue({
      data: { checks: [CHECK_FIXTURE] },
    })
    render(<LicensePlateCheckDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Available')).toBeInTheDocument()
    })
    expect(screen.getByText('Münster')).toBeInTheDocument()
  })

  it('renders "Not Available" badge for NOT_AVAILABLE status', async () => {
    getChecksMock.mockResolvedValue({
      data: { checks: [{ ...CHECK_FIXTURE, status: 'NOT_AVAILABLE' }] },
    })
    render(<LicensePlateCheckDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Not Available')).toBeInTheDocument()
    })
  })

  it('renders "Error" badge for ERROR_DURING_CHECK status', async () => {
    getChecksMock.mockResolvedValue({
      data: {
        checks: [{ ...CHECK_FIXTURE, status: 'ERROR_DURING_CHECK' }],
      },
    })
    render(<LicensePlateCheckDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument()
    })
  })

  it('shows "No workflow" button when check has no workflow', async () => {
    getChecksMock.mockResolvedValue({
      data: { checks: [CHECK_FIXTURE] },
    })
    render(<LicensePlateCheckDashboard />)

    await waitFor(() => {
      expect(screen.getByText('No workflow')).toBeInTheDocument()
    })
  })

  it('shows workflow name when check has a workflow', async () => {
    getChecksMock.mockResolvedValue({
      data: {
        checks: [
          {
            ...CHECK_FIXTURE,
            workflow: { id: 'wf-1', name: 'Auto Check' },
            executions: [{ id: 'ex-1', status: 'SUCCESS' }],
          },
        ],
      },
    })
    render(<LicensePlateCheckDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Auto Check')).toBeInTheDocument()
    })
  })

  it('shows "Never" for lastCheckedAt when null', async () => {
    getChecksMock.mockResolvedValue({
      data: {
        checks: [{ ...CHECK_FIXTURE, lastCheckedAt: null }],
      },
    })
    render(<LicensePlateCheckDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Never')).toBeInTheDocument()
    })
  })
})
