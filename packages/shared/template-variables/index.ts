export interface TemplateVariable {
  key: string
  label: string
  description: string
  example: string
  group: string
}

export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  {
    key: 'plate.cityId',
    label: 'City Code',
    description: 'City abbreviation',
    example: 'XY',
    group: 'License Plate',
  },
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
    key: 'plate.fullPlate',
    label: 'Full Plate',
    description: 'Complete plate string',
    example: 'XY AB 1234',
    group: 'License Plate',
  },
  {
    key: 'user.salutation',
    label: 'Salutation',
    description: 'User salutation',
    example: 'Herr',
    group: 'User Profile',
  },
  {
    key: 'user.firstname',
    label: 'First Name',
    description: 'User first name',
    example: 'Max',
    group: 'User Profile',
  },
  {
    key: 'user.lastname',
    label: 'Last Name',
    description: 'User last name',
    example: 'Mustermann',
    group: 'User Profile',
  },
  {
    key: 'user.birthdate',
    label: 'Birthdate',
    description: 'User date of birth',
    example: '01.01.1990',
    group: 'User Profile',
  },
  {
    key: 'user.street',
    label: 'Street',
    description: 'User street name',
    example: 'Musterstraße',
    group: 'User Profile',
  },
  {
    key: 'user.streetNumber',
    label: 'Street Number',
    description: 'User street number',
    example: '42',
    group: 'User Profile',
  },
  {
    key: 'user.zipcode',
    label: 'Zipcode',
    description: 'User postal code',
    example: '12345',
    group: 'User Profile',
  },
  {
    key: 'user.city',
    label: 'City',
    description: 'User city of residence',
    example: 'Musterstadt',
    group: 'User Profile',
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
