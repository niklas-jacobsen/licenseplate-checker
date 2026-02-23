import { describe, expect, it } from 'bun:test'
import type { BuilderIr } from '@licenseplate-checker/shared/builder-ir'
import { CompileError } from '../../types/compiler.types'
import { compileGraphToIr } from './GraphToIrCompiler'

function getBlock(ir: BuilderIr, id: string): any {
  return ir.blocks[id]
}

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
    position: { x: 400, y: 0 },
    data: { label: 'End', config: { outcome } },
  }
}

function clickNode(id = 'click-1', selector = '#btn'): TestNode {
  return {
    id,
    type: 'core.click',
    position: { x: 200, y: 0 },
    data: { label: 'Click', config: { selector } },
  }
}

function openPageNode(id = 'open-1', url = 'https://example.com'): TestNode {
  return {
    id,
    type: 'core.openPage',
    position: { x: 200, y: 0 },
    data: { label: 'Open Page', config: { url } },
  }
}

function typeTextNode(
  id = 'type-1',
  selector = '#input',
  text = 'hello'
): TestNode {
  return {
    id,
    type: 'core.typeText',
    position: { x: 200, y: 0 },
    data: { label: 'Type Text', config: { selector, text } },
  }
}

function waitDurationNode(id = 'wait-1', seconds = 3): TestNode {
  return {
    id,
    type: 'core.wait',
    position: { x: 200, y: 0 },
    data: { label: 'Wait', config: { mode: 'duration', seconds } },
  }
}

function waitSelectorNode(
  id = 'wait-1',
  selector = '#loaded',
  timeoutMs = 5000
): TestNode {
  return {
    id,
    type: 'core.wait',
    position: { x: 200, y: 0 },
    data: {
      label: 'Wait',
      config: { mode: 'selector', selector, timeoutMs },
    },
  }
}

function waitNewTabNode(id = 'wait-1', timeoutMs = 5000): TestNode {
  return {
    id,
    type: 'core.wait',
    position: { x: 200, y: 0 },
    data: { label: 'Wait', config: { mode: 'newTab', timeoutMs } },
  }
}

function conditionalExistsNode(id = 'cond-1', selector = '#el'): TestNode {
  return {
    id,
    type: 'core.conditional',
    position: { x: 200, y: 0 },
    data: {
      label: 'Condition',
      config: { operator: 'exists', selector },
    },
  }
}

function conditionalTextIncludesNode(
  id = 'cond-1',
  selector = '#el',
  value = 'hello'
): TestNode {
  return {
    id,
    type: 'core.conditional',
    position: { x: 200, y: 0 },
    data: {
      label: 'Condition',
      config: { operator: 'textIncludes', selector, value },
    },
  }
}

function selectOptionNode(
  id = 'select-1',
  mode: 'text' | 'value' | 'index' = 'text',
  extra: Record<string, unknown> = { text: 'Option A' }
): TestNode {
  return {
    id,
    type: 'core.selectOption',
    position: { x: 200, y: 0 },
    data: {
      label: 'Select',
      config: { mode, selector: '#dropdown', ...extra },
    },
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

function graph(nodes: TestNode[], edges: ReturnType<typeof edge>[]) {
  return { registryVersion: REGISTRY_VERSION, nodes, edges }
}

describe('compileGraphToIr', () => {
  describe('valid graphs', () => {
    it('compiles minimal start → end graph', () => {
      const ir = compileGraphToIr(
        graph(
          [startNode(), endNode()],
          [edge('start-1', 'end-1', 'next', 'in')]
        )
      )

      expect(ir.irVersion).toBe('v1')
      expect(ir.entryBlockId).toBe('b_start-1')
      expect(Object.keys(ir.blocks)).toHaveLength(2)

      const startBlock = getBlock(ir, 'b_start-1')
      expect(startBlock.kind).toBe('start')
      expect(startBlock.next).toBe('b_end-1')

      const endBlock = getBlock(ir, 'b_end-1')
      expect(endBlock.kind).toBe('end')
      expect(endBlock.outcome).toBe('available')
    })

    it('compiles start → click → end graph', () => {
      const ir = compileGraphToIr(
        graph(
          [startNode(), clickNode(), endNode()],
          [
            edge('start-1', 'click-1', 'next', 'in'),
            edge('click-1', 'end-1', 'next', 'in'),
          ]
        )
      )

      expect(Object.keys(ir.blocks)).toHaveLength(3)
      const clickBlock = getBlock(ir, 'b_click-1')
      expect(clickBlock.kind).toBe('action')
      expect(clickBlock.op).toEqual({ type: 'click', selector: '#btn' })
      expect(clickBlock.next).toBe('b_end-1')
    })

    it('compiles openPage action', () => {
      const ir = compileGraphToIr(
        graph(
          [startNode(), openPageNode(), endNode()],
          [
            edge('start-1', 'open-1', 'next', 'in'),
            edge('open-1', 'end-1', 'next', 'in'),
          ]
        )
      )

      const block = getBlock(ir, 'b_open-1')
      expect(block.op).toEqual({
        type: 'openPage',
        url: 'https://example.com',
      })
    })

    it('compiles typeText action', () => {
      const ir = compileGraphToIr(
        graph(
          [startNode(), typeTextNode(), endNode()],
          [
            edge('start-1', 'type-1', 'next', 'in'),
            edge('type-1', 'end-1', 'next', 'in'),
          ]
        )
      )

      const block = getBlock(ir, 'b_type-1')
      expect(block.op).toEqual({
        type: 'typeText',
        selector: '#input',
        text: 'hello',
      })
    })

    it('compiles wait duration action', () => {
      const ir = compileGraphToIr(
        graph(
          [startNode(), waitDurationNode(), endNode()],
          [
            edge('start-1', 'wait-1', 'next', 'in'),
            edge('wait-1', 'end-1', 'next', 'in'),
          ]
        )
      )

      const block = getBlock(ir, 'b_wait-1')
      expect(block.op).toEqual({ type: 'waitDuration', seconds: 3 })
    })

    it('compiles wait selector action', () => {
      const ir = compileGraphToIr(
        graph(
          [startNode(), waitSelectorNode(), endNode()],
          [
            edge('start-1', 'wait-1', 'next', 'in'),
            edge('wait-1', 'end-1', 'next', 'in'),
          ]
        )
      )

      const block = getBlock(ir, 'b_wait-1')
      expect(block.op).toEqual({
        type: 'waitSelector',
        selector: '#loaded',
        timeoutMs: 5000,
      })
    })

    it('compiles wait newTab action', () => {
      const ir = compileGraphToIr(
        graph(
          [startNode(), waitNewTabNode(), endNode()],
          [
            edge('start-1', 'wait-1', 'next', 'in'),
            edge('wait-1', 'end-1', 'next', 'in'),
          ]
        )
      )

      const block = getBlock(ir, 'b_wait-1')
      expect(block.op).toEqual({ type: 'waitNewTab', timeoutMs: 5000 })
    })

    it('compiles selectOption by text', () => {
      const ir = compileGraphToIr(
        graph(
          [
            startNode(),
            selectOptionNode('sel-1', 'text', { text: 'Opt A' }),
            endNode(),
          ],
          [
            edge('start-1', 'sel-1', 'next', 'in'),
            edge('sel-1', 'end-1', 'next', 'in'),
          ]
        )
      )

      const block = getBlock(ir, 'b_sel-1')
      expect(block.op).toEqual({
        type: 'selectByText',
        selector: '#dropdown',
        text: 'Opt A',
      })
    })

    it('compiles selectOption by value', () => {
      const ir = compileGraphToIr(
        graph(
          [
            startNode(),
            selectOptionNode('sel-1', 'value', { value: 'v1' }),
            endNode(),
          ],
          [
            edge('start-1', 'sel-1', 'next', 'in'),
            edge('sel-1', 'end-1', 'next', 'in'),
          ]
        )
      )

      const block = getBlock(ir, 'b_sel-1')
      expect(block.op).toEqual({
        type: 'selectByValue',
        selector: '#dropdown',
        value: 'v1',
      })
    })

    it('compiles selectOption by index', () => {
      const ir = compileGraphToIr(
        graph(
          [
            startNode(),
            selectOptionNode('sel-1', 'index', { index: 2 }),
            endNode(),
          ],
          [
            edge('start-1', 'sel-1', 'next', 'in'),
            edge('sel-1', 'end-1', 'next', 'in'),
          ]
        )
      )

      const block = getBlock(ir, 'b_sel-1')
      expect(block.op).toEqual({
        type: 'selectByIndex',
        selector: '#dropdown',
        index: 2,
      })
    })

    it('compiles conditional with exists operator', () => {
      const ir = compileGraphToIr(
        graph(
          [
            startNode(),
            conditionalExistsNode('cond-1', '.alert'),
            endNode('end-t'),
            endNode('end-f', 'unavailable'),
          ],
          [
            edge('start-1', 'cond-1', 'next', 'in'),
            edge('cond-1', 'end-t', 'true', 'in'),
            edge('cond-1', 'end-f', 'false', 'in'),
          ]
        )
      )

      const block = getBlock(ir, 'b_cond-1')
      expect(block.kind).toBe('branch')
      expect(block.condition).toEqual({ op: 'exists', selector: '.alert' })
      expect(block.whenTrue).toBe('b_end-t')
      expect(block.whenFalse).toBe('b_end-f')
    })

    it('compiles conditional with textIncludes operator', () => {
      const ir = compileGraphToIr(
        graph(
          [
            startNode(),
            conditionalTextIncludesNode('cond-1', '#msg', 'success'),
            endNode('end-t'),
            endNode('end-f', 'unavailable'),
          ],
          [
            edge('start-1', 'cond-1', 'next', 'in'),
            edge('cond-1', 'end-t', 'true', 'in'),
            edge('cond-1', 'end-f', 'false', 'in'),
          ]
        )
      )

      const block = getBlock(ir, 'b_cond-1')
      expect(block.condition).toEqual({
        op: 'textIncludes',
        selector: '#msg',
        value: 'success',
      })
    })

    it('preserves end node outcome', () => {
      const ir = compileGraphToIr(
        graph(
          [startNode(), endNode('end-1', 'unavailable')],
          [edge('start-1', 'end-1', 'next', 'in')]
        )
      )

      expect(getBlock(ir, 'b_end-1').outcome).toBe('unavailable')
    })
  })

  describe('schema errors', () => {
    it('throws CompileError for invalid input', () => {
      expect(() => compileGraphToIr({ invalid: true })).toThrow(CompileError)
    })

    it('throws CompileError for null input', () => {
      expect(() => compileGraphToIr(null)).toThrow(CompileError)
    })

    it('includes graph.parse issue', () => {
      try {
        compileGraphToIr({ invalid: true })
        expect.unreachable('should have thrown')
      } catch (err) {
        expect(err).toBeInstanceOf(CompileError)
        const compileErr = err as InstanceType<typeof CompileError>
        expect(compileErr.issues[0].type).toBe('graph.parse')
      }
    })
  })

  describe('structural errors', () => {
    it('throws when start node has no outgoing edge', () => {
      expect(() =>
        compileGraphToIr(graph([startNode(), endNode()], []))
      ).toThrow(CompileError)
    })

    it('throws when action node has no outgoing edge', () => {
      try {
        compileGraphToIr(
          graph(
            [startNode(), clickNode(), endNode()],
            [edge('start-1', 'click-1', 'next', 'in')]
          )
        )
        expect.unreachable('should have thrown')
      } catch (err) {
        const compileErr = err as InstanceType<typeof CompileError>
        expect(
          compileErr.issues.some(
            (issue) =>
              issue.type === 'node.missingNext' && issue.nodeId === 'click-1'
          )
        ).toBe(true)
      }
    })

    it('throws when conditional node is missing a branch edge', () => {
      try {
        compileGraphToIr(
          graph(
            [
              startNode(),
              conditionalExistsNode(),
              endNode('end-t'),
              endNode('end-f', 'unavailable'),
            ],
            [
              edge('start-1', 'cond-1', 'next', 'in'),
              edge('cond-1', 'end-t', 'true', 'in'),
              // missing false edge
            ]
          )
        )
        expect.unreachable('should have thrown')
      } catch (err) {
        const compileErr = err as InstanceType<typeof CompileError>
        expect(
          compileErr.issues.some(
            (issue) =>
              issue.type === 'node.missingBranch' && issue.nodeId === 'cond-1'
          )
        ).toBe(true)
      }
    })

    it('throws when graph has no start node', () => {
      expect(() =>
        compileGraphToIr(graph([endNode(), endNode('end-2')], []))
      ).toThrow(CompileError)
    })

    it('throws when graph has multiple start nodes', () => {
      try {
        compileGraphToIr(
          graph(
            [startNode('s1'), startNode('s2'), endNode()],
            [
              edge('s1', 'end-1', 'next', 'in'),
              edge('s2', 'end-1', 'next', 'in'),
            ]
          )
        )
        expect.unreachable('should have thrown')
      } catch (err) {
        const compileErr = err as InstanceType<typeof CompileError>
        expect(
          compileErr.issues.some((issue) => issue.type === 'graph.start.count')
        ).toBe(true)
      }
    })
  })
})
