import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { renderHook, act } from '@testing-library/react'
import { usePersistedForm } from './use-persisted-form'

const STORAGE_KEY = 'test-form'

function mockForm() {
  return {
    reset: mock(),
    getValues: mock(),
    setValue: mock(),
    watch: mock(),
    handleSubmit: mock(),
    formState: { errors: {} },
    register: mock(),
    control: {} as any,
    unregister: mock(),
    setError: mock(),
    clearErrors: mock(),
    trigger: mock(),
    setFocus: mock(),
    getFieldState: mock(),
    resetField: mock(),
  } as any
}

describe('usePersistedForm', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('restores saved data from localStorage and removes the key', () => {
    const saved = { city: 'MS', letters: 'AB' }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))

    const form = mockForm()
    renderHook(() => usePersistedForm(form, STORAGE_KEY))

    expect(form.reset).toHaveBeenCalledWith(saved)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('does nothing when no saved data exists', () => {
    const form = mockForm()
    renderHook(() => usePersistedForm(form, STORAGE_KEY))

    expect(form.reset).not.toHaveBeenCalled()
  })

  it('handles malformed JSON without crashing', () => {
    const spy = spyOn(console, 'error').mockImplementation(() => undefined)
    localStorage.setItem(STORAGE_KEY, '{not valid json')

    const form = mockForm()
    renderHook(() => usePersistedForm(form, STORAGE_KEY))

    expect(form.reset).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('saveForm persists data to localStorage', () => {
    const form = mockForm()
    const { result } = renderHook(() => usePersistedForm(form, STORAGE_KEY))

    const data = { city: 'K', letters: 'XY' }
    act(() => {
      result.current.saveForm(data)
    })

    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(data))
  })

  it('uses the correct key for different form instances', () => {
    const form = mockForm()
    const { result } = renderHook(() => usePersistedForm(form, 'other-key'))

    act(() => {
      result.current.saveForm({ value: 1 })
    })

    expect(localStorage.getItem('other-key')).toBe(JSON.stringify({ value: 1 }))
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
