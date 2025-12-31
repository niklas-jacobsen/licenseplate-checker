import { z } from 'zod'
import type { NodeSpec } from '../registry'

export const endNode: NodeSpec = {
  type: 'core.end',
  label: 'End',
  category: 'Flow',

  inputs: [{ id: 'in' }],
  outputs: [],

  propsSchema: z.object({}),
}
