import * as nodes from '@licenseplate-checker/shared/node-registry/nodes'

//Defines the nodes that can be added to the canvas by the user
export const PALETTE_NODES = [
  nodes.clickNode,
  nodes.typeTextNode,
  nodes.selectOptionNode,
  nodes.conditionalNode,
  nodes.waitNode,
  nodes.endNode,
]
