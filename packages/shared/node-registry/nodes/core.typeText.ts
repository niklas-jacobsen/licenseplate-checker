import type { NodeSpec } from '../registry'
import { TypeTextNodeConfig } from '../../workflow-dsl/config'

export const typeTextNode: NodeSpec = {
  type: 'core.typeText',
  label: 'Type Text',
  category: 'Browser',

  inputs: [{ id: 'in' }],
  outputs: [{ id: 'next' }],

  propsSchema: TypeTextNodeConfig,
}
