import { z } from 'zod'
import type { NodeSpec } from '../registry'

export const typeTextNode: NodeSpec = {
  type: 'core.typeText',
  label: 'Type Text',
  category: 'Browser',

  inputs: [{ id: 'in' }],
  outputs: [{ id: 'next' }],

  propsSchema: z.object({
    selector: z.string().min(1),
    text: z.string(),
  }),
}
