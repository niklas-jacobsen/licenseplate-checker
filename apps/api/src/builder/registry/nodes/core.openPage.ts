import { z } from 'zod'
import type { NodeSpec } from '../registry'

export const openPageNode: NodeSpec = {
  type: 'core.openPage',
  label: 'Open Page',
  category: 'Browser',

  inputs: [{ id: 'in' }],
  outputs: [{ id: 'next' }],

  propsSchema: z.object({
    url: z.string().url(),
  }),
}
