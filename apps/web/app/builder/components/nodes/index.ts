import { StartNode } from './start-node'
import { EndNode } from './end-node'
import { ClickNode } from './click-node'
import { TypeTextNode } from './type-text-node'
import { OpenPageNode } from './open-page-node'
import { ConditionalNode } from './conditional-node'
import { WaitNode } from './wait-node'

export const nodeTypes = {
  'core.start': StartNode,
  'core.end': EndNode,
  'core.click': ClickNode,
  'core.typeText': TypeTextNode,
  'core.openPage': OpenPageNode,
  'core.conditional': ConditionalNode,
  'core.wait': WaitNode,
}
