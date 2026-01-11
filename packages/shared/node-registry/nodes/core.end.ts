import type { NodeSpec } from '../registry'
import { EndNodeConfig } from '../../workflow-dsl/config'

export const endNode: NodeSpec = {
  type: 'core.end',
  label: 'End',
  category: 'Flow',

  inputs: [{ id: 'in' }],
  outputs: [],

  propsSchema: EndNodeConfig,
}
