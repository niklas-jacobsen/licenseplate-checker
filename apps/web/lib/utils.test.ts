import { describe, expect, it } from 'bun:test'
import { toTitleCase } from './utils'

describe('toTitleCase', () => {
  it('converts uppercase words to title case', () => {
    expect(toTitleCase('HELLO WORLD')).toBe('Hello World')
  })

  it('converts lowercase words to title case', () => {
    expect(toTitleCase('hello world')).toBe('Hello World')
  })

  it('handles a single word', () => {
    expect(toTitleCase('hello')).toBe('Hello')
  })

  it('handles empty string', () => {
    expect(toTitleCase('')).toBe('')
  })

  it('handles mixed case', () => {
    expect(toTitleCase('hElLo WoRlD')).toBe('Hello World')
  })
})
