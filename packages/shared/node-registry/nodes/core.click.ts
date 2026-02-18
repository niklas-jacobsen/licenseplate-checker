import type { NodeSpec } from '../registry'
import { ClickNodeConfig } from '../../workflow-dsl/config'

export const clickNode: NodeSpec = {
  type: 'core.click',
  label: 'Click',
  category: 'Browser',

  inputs: [{ id: 'in' }],
  outputs: [{ id: 'next' }],

  propsSchema: ClickNodeConfig,
}
