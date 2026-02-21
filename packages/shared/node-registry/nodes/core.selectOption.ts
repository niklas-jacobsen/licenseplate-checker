import type { NodeSpec } from '../registry'
import { SelectOptionNodeConfig } from '../../workflow-dsl/config'

export const selectOptionNode: NodeSpec = {
  type: 'core.selectOption',
  label: 'Select Option',
  category: 'Browser',

  inputs: [{ id: 'in' }],
  outputs: [{ id: 'next' }],

  propsSchema: SelectOptionNodeConfig,
}
