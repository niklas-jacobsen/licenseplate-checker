import type { NodeSpec } from '../registry'
import { StartNodeConfig } from '../../workflow-dsl/config'

export const startNode: NodeSpec = {
  type: 'core.start',
  label: 'Start',
  category: 'Flow',

  inputs: [],
  outputs: [{ id: 'next' }],

  propsSchema: StartNodeConfig,
}
