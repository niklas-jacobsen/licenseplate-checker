import type { NodeSpec } from '../registry'
import { ConditionalNodeConfig } from '../../workflow-dsl/config'

export const conditionalNode: NodeSpec = {
  type: 'core.conditional',
  label: 'Condition',
  category: 'Logic',

  inputs: [{ id: 'in' }],
  outputs: [{ id: 'true' }, { id: 'false' }],

  propsSchema: ConditionalNodeConfig,
}
