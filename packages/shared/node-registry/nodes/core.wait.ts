import type { NodeSpec } from '../registry'
import { WaitNodeConfig } from '../../workflow-dsl/config'

export const waitNode: NodeSpec = {
  type: 'core.wait',
  label: 'Wait',
  category: 'Flow',

  inputs: [{ id: 'in' }],
  outputs: [{ id: 'next' }],

  propsSchema: WaitNodeConfig,
}
