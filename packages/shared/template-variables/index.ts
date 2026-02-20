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
