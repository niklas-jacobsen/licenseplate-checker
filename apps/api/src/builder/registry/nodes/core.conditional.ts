import { z } from 'zod'
import type { NodeSpec } from '../registry'

export const conditionalNode: NodeSpec = {
  type: 'core.conditional',
  label: 'Condition',
  category: 'Logic',

  inputs: [{ id: 'in' }],
  outputs: [{ id: 'true' }, { id: 'false' }],

  propsSchema: z.discriminatedUnion('operator', [
    z.object({
      operator: z.literal('exists'),
      selector: z.string().min(1),
    }),
    z.object({
      operator: z.literal('textIncludes'),
      selector: z.string().min(1),
      value: z.string().min(1),
    }),
  ]),
}
