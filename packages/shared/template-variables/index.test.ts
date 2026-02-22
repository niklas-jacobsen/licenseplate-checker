import { describe, expect, it } from 'bun:test'
import {
  resolveVariables,
  containsTemplateVariables,
  parseTemplate,
  segmentsToString,
  extractVariableKeys,
} from './index'

describe('resolveVariables', () => {
  it('replaces a single variable', () => {
    const result = resolveVariables('Hello {{ plate.letters }}', {
      'plate.letters': 'AB',
    })
    expect(result).toBe('Hello AB')
  })

  it('replaces multiple variables', () => {
    const result = resolveVariables('{{ plate.cityId }} {{ plate.numbers }}', {
      'plate.cityId': 'HAM',
      'plate.numbers': '123',
    })
    expect(result).toBe('HAM 123')
  })

  it('leaves unknown variables unchanged', () => {
    const result = resolveVariables('{{ unknown.var }}', {})
    expect(result).toBe('{{ unknown.var }}')
  })

  it('handles empty context', () => {
    const result = resolveVariables('{{ plate.letters }}', {})
    expect(result).toBe('{{ plate.letters }}')
  })

  it('handles template with no variables', () => {
    const result = resolveVariables('plain text', { 'plate.letters': 'AB' })
    expect(result).toBe('plain text')
  })

  it('handles variables with extra whitespace', () => {
    const result = resolveVariables('{{  plate.letters  }}', {
      'plate.letters': 'AB',
    })
    expect(result).toBe('AB')
  })
})

describe('containsTemplateVariables', () => {
  it('returns true for template with variable', () => {
    expect(containsTemplateVariables('{{ plate.letters }}')).toBe(true)
  })

  it('returns true for variable embedded in text', () => {
    expect(containsTemplateVariables('Hello {{ user.firstname }}!')).toBe(true)
  })

  it('returns false for plain text', () => {
    expect(containsTemplateVariables('plain text')).toBe(false)
  })

  it('returns false for single braces', () => {
    expect(containsTemplateVariables('{not a var}')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(containsTemplateVariables('')).toBe(false)
  })
})

describe('parseTemplate', () => {
  it('parses plain text as single segment', () => {
    const segments = parseTemplate('hello world')
    expect(segments).toEqual([{ type: 'text', value: 'hello world' }])
  })

  it('parses a single variable with surrounding text', () => {
    const segments = parseTemplate('Hello {{ user.firstname }}!')
    expect(segments).toEqual([
      { type: 'text', value: 'Hello ' },
      { type: 'variable', key: 'user.firstname' },
      { type: 'text', value: '!' },
    ])
  })

  it('prepends empty text segment when template starts with variable', () => {
    const segments = parseTemplate('{{ plate.cityId }} AB')
    expect(segments[0]).toEqual({ type: 'text', value: '' })
    expect(segments[1]).toEqual({ type: 'variable', key: 'plate.cityId' })
    expect(segments[2]).toEqual({ type: 'text', value: ' AB' })
  })

  it('parses multiple variables', () => {
    const segments = parseTemplate('{{ plate.cityId }}-{{ plate.letters }}')
    expect(segments).toEqual([
      { type: 'text', value: '' },
      { type: 'variable', key: 'plate.cityId' },
      { type: 'text', value: '-' },
      { type: 'variable', key: 'plate.letters' },
      { type: 'text', value: '' },
    ])
  })

  it('handles empty string', () => {
    const segments = parseTemplate('')
    expect(segments).toEqual([{ type: 'text', value: '' }])
  })
})

describe('segmentsToString', () => {
  it('converts segments back to template string', () => {
    const result = segmentsToString([
      { type: 'text', value: 'Hello ' },
      { type: 'variable', key: 'user.firstname' },
      { type: 'text', value: '!' },
    ])
    expect(result).toBe('Hello {{ user.firstname }}!')
  })

  it('round-trips with parseTemplate', () => {
    const template = 'Hello {{ user.firstname }}, your plate is {{ plate.fullPlate }}'
    const segments = parseTemplate(template)
    expect(segmentsToString(segments)).toBe(template)
  })

  it('handles empty segments', () => {
    expect(segmentsToString([])).toBe('')
  })
})

describe('extractVariableKeys', () => {
  it('extracts keys from template', () => {
    const keys = extractVariableKeys(
      '{{ plate.cityId }} {{ plate.letters }} {{ plate.numbers }}'
    )
    expect(keys).toEqual(['plate.cityId', 'plate.letters', 'plate.numbers'])
  })

  it('returns empty array for plain text', () => {
    expect(extractVariableKeys('no variables here')).toEqual([])
  })

  it('returns empty array for empty string', () => {
    expect(extractVariableKeys('')).toEqual([])
  })
})
