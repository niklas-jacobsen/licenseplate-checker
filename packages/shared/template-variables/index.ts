export interface TemplateVariable {
  key: string
  label: string
  description: string
  example: string
  group: string
}

export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  {
    key: 'plate.letters',
    label: 'Letters',
    description: 'Letter combination',
    example: 'AB',
    group: 'License Plate',
  },
  {
    key: 'plate.numbers',
    label: 'Numbers',
    description: 'Number combination',
    example: '1234',
    group: 'License Plate',
  },
  {
    key: 'plate.cityId',
    label: 'City Code',
    description: 'City abbreviation',
    example: 'MS',
    group: 'License Plate',
  },
  {
    key: 'plate.fullPlate',
    label: 'Full Plate',
    description: 'Complete plate string',
    example: 'MS AB 1234',
    group: 'License Plate',
  },
]

export type VariableContext = Record<string, string>

export function resolveVariables(
  template: string,
  ctx: VariableContext
): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, key) => {
    return ctx[key] ?? _match
  })
}

export function containsTemplateVariables(value: string): boolean {
  return /\{\{.*?\}\}/.test(value)
}

// helpers

export type Segment =
  | { type: 'text'; value: string }
  | { type: 'variable'; key: string }

const TEMPLATE_REGEX = /\{\{\s*([\w.]+)\s*\}\}/g

export function parseTemplate(str: string): Segment[] {
  const segments: Segment[] = []
  let lastIndex = 0

  for (const match of str.matchAll(TEMPLATE_REGEX)) {
    const index = match.index!
    if (index > lastIndex) {
      segments.push({ type: 'text', value: str.slice(lastIndex, index) })
    }
    segments.push({ type: 'variable', key: match[1] })
    lastIndex = index + match[0].length
  }

  // remaining text after variables
  segments.push({ type: 'text', value: str.slice(lastIndex) })

  if (segments[0]?.type !== 'text') {
    segments.unshift({ type: 'text', value: '' })
  }

  return segments
}

export function segmentsToString(segments: Segment[]): string {
  return segments
    .map((s) => (s.type === 'text' ? s.value : `{{ ${s.key} }}`))
    .join('')
}

export function extractVariableKeys(template: string): string[] {
  return [...template.matchAll(TEMPLATE_REGEX)].map((m) => m[1])
}
