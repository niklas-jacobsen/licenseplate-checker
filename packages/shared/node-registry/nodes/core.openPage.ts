import type { NodeSpec } from '../registry'
import { OpenPageNodeConfig } from '../../workflow-dsl/config'

export const openPageNode: NodeSpec = {
  type: 'core.openPage',
  label: 'Open Page',
  category: 'Browser',

  inputs: [{ id: 'in' }],
  outputs: [{ id: 'next' }],

  propsSchema: OpenPageNodeConfig,
}
