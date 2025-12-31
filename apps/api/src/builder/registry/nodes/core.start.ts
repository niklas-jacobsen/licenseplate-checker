import { z } from 'zod'
import type { NodeSpec } from '../registry'

export const startNode: NodeSpec = {
  type: 'core.start',
  label: 'Start',
  category: 'Flow',

  inputs: [],
  outputs: [{ id: 'next' }],

  propsSchema: z.object({}),
}
