import { describe, expect, it } from 'bun:test'
import { renderHook } from '@testing-library/react'
import { usePlateInput } from './use-plate-input'

describe('usePlateInput', () => {
  function getFormatters() {
    const { result } = renderHook(() => usePlateInput())
    return result.current
  }

  describe('formatLetters', () => {
    it('uppercases input', () => {
      expect(getFormatters().formatLetters('ab')).toBe('AB')
    })

    it('strips non-alpha characters', () => {
      expect(getFormatters().formatLetters('A1B!')).toBe('AB')
    })

    it('limits to 2 characters', () => {
      expect(getFormatters().formatLetters('ABCD')).toBe('AB')
    })

    it('returns empty string for empty input', () => {
      expect(getFormatters().formatLetters('')).toBe('')
    })

    it('returns empty string for digits-only input', () => {
      expect(getFormatters().formatLetters('123')).toBe('')
    })
  })

  describe('formatNumbers', () => {
    it('strips non-numeric characters', () => {
      expect(getFormatters().formatNumbers('1a2b')).toBe('12')
    })

    it('removes leading zeros', () => {
      expect(getFormatters().formatNumbers('0123')).toBe('123')
    })

    it('limits to 4 digits', () => {
      expect(getFormatters().formatNumbers('12345')).toBe('1234')
    })

    it('returns empty string for empty input', () => {
      expect(getFormatters().formatNumbers('')).toBe('')
    })

    it('returns empty string for letters-only input', () => {
      expect(getFormatters().formatNumbers('abc')).toBe('')
    })

    it('handles single zero as empty', () => {
      expect(getFormatters().formatNumbers('0')).toBe('')
    })
  })
})
