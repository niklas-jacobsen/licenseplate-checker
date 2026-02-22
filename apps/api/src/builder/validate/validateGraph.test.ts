import { describe, expect, it } from 'bun:test'
import { BUILDER_MAX_NODES_PER_GRAPH } from '@licenseplate-checker/shared/constants/limits'
import { validateGraph } from './validateGraph'

const REGISTRY_VERSION = '1'

type TestNode = {
  id: string
  type: string
  position: { x: number; y: number }
  data: { label: string; config: Record<string, unknown> }
}

function startNode(id = 'start-1'): TestNode {
  return {
    id,
    type: 'core.start',
    position: { x: 0, y: 0 },
    data: { label: 'Start', config: {} },
  }
}

function endNode(
  id = 'end-1',
  outcome: 'available' | 'unavailable' = 'available'
): TestNode {
  return {
    id,
    type: 'core.end',
    position: { x: 200, y: 0 },
    data: { label: 'End', config: { outcome } },
  }
}

function clickNode(id = 'click-1', selector = '#btn'): TestNode {
  return {
    id,
    type: 'core.click',
    position: { x: 100, y: 0 },
    data: { label: 'Click', config: { selector } },
  }
}

function edge(
  source: string,
  target: string,
  sourceHandle?: string,
  targetHandle?: string,
  id?: string
) {
  return {
    id: id ?? `${source}-${target}`,
    source,
    target,
    sourceHandle,
    targetHandle,
  }
}

function minimalGraph() {
  return {
    registryVersion: REGISTRY_VERSION,
    nodes: [startNode(), endNode()],
    edges: [edge('start-1', 'end-1', 'next', 'in')],
  }
}

describe('validateGraph', () => {
  it('validates a minimal start → end graph', () => {
    const result = validateGraph(minimalGraph())
    expect(result.ok).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  it('validates a start → click → end graph', () => {
    const result = validateGraph({
      registryVersion: REGISTRY_VERSION,
      nodes: [startNode(), clickNode(), endNode()],
      edges: [
        edge('start-1', 'click-1', 'next', 'in'),
        edge('click-1', 'end-1', 'next', 'in'),
      ],
    })
    expect(result.ok).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  describe('schema validation', () => {
    it('rejects input that does not match schema', () => {
      const result = validateGraph({ invalid: true })
      expect(result.ok).toBe(false)
      expect(result.issues[0].type).toBe('graph.parse')
    })

    it('rejects null input', () => {
      const result = validateGraph(null)
      expect(result.ok).toBe(false)
      expect(result.issues[0].type).toBe('graph.parse')
    })

    it('rejects graph missing registryVersion', () => {
      const result = validateGraph({
        nodes: [startNode(), endNode()],
        edges: [edge('start-1', 'end-1', 'next', 'in')],
      })
      expect(result.ok).toBe(false)
      expect(result.issues[0].type).toBe('graph.parse')
    })
  })

  describe('node count limits', () => {
    it('flags graph with fewer than 2 nodes', () => {
      const result = validateGraph({
        registryVersion: REGISTRY_VERSION,
        nodes: [startNode()],
        edges: [],
      })
      expect(result.ok).toBe(true)
      expect(result.issues.some((issue) => issue.type === 'graph.nodeLimit')).toBe(true)
    })

    it('flags graph exceeding max nodes', () => {
      const nodes = [startNode(), endNode()]
      for (let i = 0; i < BUILDER_MAX_NODES_PER_GRAPH; i++) {
        nodes.push(clickNode(`click-${i}`))
      }
      const result = validateGraph({
        registryVersion: REGISTRY_VERSION,
        nodes,
        edges: [edge('start-1', 'end-1', 'next', 'in')],
      })
      expect(result.issues.some((issue) => issue.type === 'graph.nodeLimit')).toBe(true)
    })
  })

  describe('start and end node validation', () => {
    it('flags graph with no start node', () => {
      const result = validateGraph({
        registryVersion: REGISTRY_VERSION,
        nodes: [endNode('e1'), endNode('e2')],
        edges: [],
      })
      expect(result.issues.some((issue) => issue.type === 'graph.start.count')).toBe(
        true
      )
    })

    it('flags graph with multiple start nodes', () => {
      const result = validateGraph({
        registryVersion: REGISTRY_VERSION,
        nodes: [startNode('s1'), startNode('s2'), endNode()],
        edges: [
          edge('s1', 'end-1', 'next', 'in'),
          edge('s2', 'end-1', 'next', 'in'),
        ],
      })
      expect(result.issues.some((issue) => issue.type === 'graph.start.count')).toBe(
        true
      )
    })

    it('flags graph with no end node', () => {
      const result = validateGraph({
        registryVersion: REGISTRY_VERSION,
        nodes: [startNode(), clickNode()],
        edges: [edge('start-1', 'click-1', 'next', 'in')],
      })
      expect(result.issues.some((issue) => issue.type === 'graph.end.count')).toBe(true)
    })
  })

  describe('edge validation', () => {
    it('flags edge referencing missing node', () => {
      const result = validateGraph({
        registryVersion: REGISTRY_VERSION,
        nodes: [startNode(), endNode()],
        edges: [
          edge('start-1', 'end-1', 'next', 'in'),
          edge('start-1', 'nonexistent', 'next', 'in'),
        ],
      })
      expect(result.issues.some((issue) => issue.type === 'edge.missingNode')).toBe(
        true
      )
    })

    it('flags invalid source handle', () => {
      const result = validateGraph({
        registryVersion: REGISTRY_VERSION,
        nodes: [startNode(), endNode()],
        edges: [edge('start-1', 'end-1', 'bad-handle', 'in')],
      })
      expect(result.issues.some((issue) => issue.type === 'edge.invalidHandle')).toBe(
        true
      )
    })

    it('flags invalid target handle', () => {
      const result = validateGraph({
        registryVersion: REGISTRY_VERSION,
        nodes: [startNode(), endNode()],
        edges: [edge('start-1', 'end-1', 'next', 'bad-handle')],
      })
      expect(result.issues.some((issue) => issue.type === 'edge.invalidHandle')).toBe(
        true
      )
    })

    it('flags edge with missing handles', () => {
      const result = validateGraph({
        registryVersion: REGISTRY_VERSION,
        nodes: [startNode(), endNode()],
        edges: [edge('start-1', 'end-1')],
      })
      expect(result.issues.some((issue) => issue.type === 'edge.invalidHandle')).toBe(
        true
      )
    })
  })

  describe('reachability', () => {
    it('flags unreachable nodes', () => {
      const result = validateGraph({
        registryVersion: REGISTRY_VERSION,
        nodes: [startNode(), endNode(), clickNode('orphan')],
        edges: [edge('start-1', 'end-1', 'next', 'in')],
      })
      expect(
        result.issues.some(
          (issue) => issue.type === 'graph.unreachable' && issue.nodeId === 'orphan'
        )
      ).toBe(true)
    })

    it('does not flag reachable nodes', () => {
      const result = validateGraph(minimalGraph())
      expect(result.issues.some((issue) => issue.type === 'graph.unreachable')).toBe(
        false
      )
    })
  })
})
