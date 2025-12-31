import { z } from 'zod'
import type { NodeSpec } from '../registry'

export const clickNode: NodeSpec = {
  type: 'core.click',
  label: 'Click Element',
  category: 'Browser',

  inputs: [{ id: 'in' }],
  outputs: [{ id: 'next' }],

  propsSchema: z.object({
    selector: z.string().min(1),
  }),
}
