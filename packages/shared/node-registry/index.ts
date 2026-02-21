import type { NodeSpec } from './registry'
import { startNode } from './nodes/core.start'
import { endNode } from './nodes/core.end'
import { openPageNode } from './nodes/core.openPage'
import { clickNode } from './nodes/core.click'
import { typeTextNode } from './nodes/core.typeText'
import { conditionalNode } from './nodes/core.conditional'
import { waitNode } from './nodes/core.wait'
import { selectOptionNode } from './nodes/core.selectOption'

export const BUILDER_REGISTRY_VERSION = 'v1'

export const nodeRegistry: Record<string, NodeSpec> = {
  [startNode.type]: startNode,
  [endNode.type]: endNode,
  [openPageNode.type]: openPageNode,
  [clickNode.type]: clickNode,
  [typeTextNode.type]: typeTextNode,
  [conditionalNode.type]: conditionalNode,
  [waitNode.type]: waitNode,
  [selectOptionNode.type]: selectOptionNode,
}
