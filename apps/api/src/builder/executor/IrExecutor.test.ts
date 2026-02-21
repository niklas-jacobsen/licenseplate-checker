import { describe, expect, it, mock, beforeEach } from 'bun:test'
import type { BuilderIr } from '@shared/builder-ir'

// Mock Playwright
const pageMock = {
  goto: mock(() => Promise.resolve()),
  click: mock(() => Promise.resolve()),
  fill: mock(() => Promise.resolve()),
  waitForLoadState: mock(() => Promise.resolve()),
  locator: mock(() => ({
    count: mock(() => Promise.resolve(1)),
  })),
  textContent: mock(() => Promise.resolve('some text content')),
  route: mock(() => Promise.resolve()),
  _isMock: true,
}

const browserMock = {
  newPage: mock(() => Promise.resolve(pageMock)),
  close: mock(() => Promise.resolve()),
}

mock.module('playwright', () => ({
  chromium: {
    launch: mock(() => Promise.resolve(browserMock)),
  },
}))

describe('IrExecutor', () => {
  let IrExecutor: any
  let executor: any

  beforeEach(async () => {
    const mod = await import('./IrExecutor')
    IrExecutor = mod.IrExecutor
    executor = new IrExecutor({
      allowedDomains: ['niklas.to'],
      cityName: 'Test',
    })

    pageMock.goto.mockClear()
    pageMock.click.mockClear()
    pageMock.fill.mockClear()
    browserMock.close.mockClear()
  })

  it('executes a simple linear flow', async () => {
    const ir: BuilderIr = {
      irVersion: 'v1',
      registryVersion: 'v1',
      entryBlockId: 'start',
      blocks: {
        start: {
          id: 'start',
          kind: 'start',
          sourceNodeId: 'n1',
          next: 'action1',
        },
        action1: {
          id: 'action1',
          kind: 'action',
          sourceNodeId: 'n2',
          op: { type: 'openPage', url: 'https://niklas.to' },
          next: 'end',
        },
        end: {
          id: 'end',
          kind: 'end',
          sourceNodeId: 'n3',
          outcome: 'available',
        },
      },
    }

    const result = await executor.execute(ir)

    expect(result.success).toBe(true)
    expect(pageMock.goto).toHaveBeenCalledWith('https://niklas.to')
    expect(browserMock.close).toHaveBeenCalled()
  })

  it('handles branching logic (true path)', async () => {
     // mock to return true (count > 0)
     pageMock.locator.mockImplementationOnce(() => ({
      count: mock(() => Promise.resolve(1)),
    }))

    const ir: BuilderIr = {
      irVersion: 'v1',
      registryVersion: 'v1',
      entryBlockId: 'start',
      blocks: {
        start: { id: 'start', kind: 'start', sourceNodeId: 'n1', next: 'branch1' },
        branch1: {
          id: 'branch1',
          kind: 'branch',
          sourceNodeId: 'n2',
          condition: { op: 'exists', selector: '#success' },
          whenTrue: 'actionTrue',
          whenFalse: 'actionFalse',
        },
        actionTrue: {
          id: 'actionTrue',
          kind: 'action',
          sourceNodeId: 'n3',
          op: { type: 'click', selector: '#btn-true' },
          next: 'end',
        },
        actionFalse: {
          id: 'actionFalse',
          kind: 'action',
          sourceNodeId: 'n4',
          op: { type: 'click', selector: '#btn-false' },
          next: 'end',
        },
        end: { id: 'end', kind: 'end', sourceNodeId: 'n5', outcome: 'available' },
      },
    }

    const result = await executor.execute(ir)

    expect(result.success).toBe(true)
    expect(pageMock.click).toHaveBeenCalledWith('#btn-true')
    expect(pageMock.click).not.toHaveBeenCalledWith('#btn-false')
  })

  it('handles branching logic (false path)', async () => {
    // Mock to return false (count = 0)
    pageMock.locator.mockImplementationOnce(() => ({
     count: mock(() => Promise.resolve(0)),
   }))

   const ir: BuilderIr = {
     irVersion: 'v1',
     registryVersion: 'v1',
     entryBlockId: 'start',
     blocks: {
       start: { id: 'start', kind: 'start', sourceNodeId: 'n1', next: 'branch1' },
       branch1: {
         id: 'branch1',
         kind: 'branch',
         sourceNodeId: 'n2',
         condition: { op: 'exists', selector: '#success' },
         whenTrue: 'actionTrue',
         whenFalse: 'actionFalse',
       },
       actionTrue: {
         id: 'actionTrue',
         kind: 'action',
         sourceNodeId: 'n3',
         op: { type: 'click', selector: '#btn-true' },
         next: 'end',
       },
       actionFalse: {
         id: 'actionFalse',
         kind: 'action',
         sourceNodeId: 'n4',
         op: { type: 'click', selector: '#btn-false' },
         next: 'end',
       },
       end: { id: 'end', kind: 'end', sourceNodeId: 'n5', outcome: 'available' },
     },
   }

   const result = await executor.execute(ir)

   expect(result.success).toBe(true)
   expect(pageMock.click).toHaveBeenCalledWith('#btn-false')
   expect(pageMock.click).not.toHaveBeenCalledWith('#btn-true')
  })

  it('handles typeText action', async () => {
    const ir: any = {
      irVersion: 'v1',
      registryVersion: 'v1',
      entryBlockId: 'start',
      blocks: {
        start: { id: 'start', kind: 'start', sourceNodeId: 'n1', next: 'action1' },
        action1: {
          id: 'action1',
          kind: 'action',
          sourceNodeId: 'n2',
          op: { type: 'typeText', selector: '#input', text: 'hello' },
          next: 'end',
        },
        end: { id: 'end', kind: 'end', sourceNodeId: 'n3', outcome: 'available' },
      },
    }

    const result = await executor.execute(ir)

    expect(result.success).toBe(true)
    expect(pageMock.fill).toHaveBeenCalledWith('#input', 'hello')
  })

  it('handles unknown block kind error', async () => {
    const ir: any = {
      irVersion: 'v1',
      registryVersion: 'v1',
      entryBlockId: 'start',
      blocks: {
        start: { id: 'start', kind: 'unknown' as any, sourceNodeId: 'n1' },
      },
    }

    const result = await executor.execute(ir)

    expect(result.success).toBe(false)
    expect(result.error).toContain('Unknown block kind: unknown')
  })

  it('handles unknown action type error', async () => {
    const ir: any = {
      irVersion: 'v1',
      registryVersion: 'v1',
      entryBlockId: 'start',
      blocks: {
        start: { id: 'start', kind: 'start', sourceNodeId: 'n1', next: 'action1' },
        action1: {
          id: 'action1',
          kind: 'action',
          sourceNodeId: 'n2',
          op: { type: 'unknown' as any },
          next: 'end',
        },
        end: { id: 'end', kind: 'end', sourceNodeId: 'n3', outcome: 'available' },
      },
    }

    const result = await executor.execute(ir)

    expect(result.success).toBe(false)
    expect(result.error).toContain('Unknown action type: unknown')
  })

  it('handles block not found error', async () => {
    const ir: any = {
      irVersion: 'v1',
      registryVersion: 'v1',
      entryBlockId: 'start',
      blocks: {
        start: { id: 'start', kind: 'start', sourceNodeId: 'n1', next: 'missing' },
      },
    }

    const result = await executor.execute(ir)

    expect(result.success).toBe(false)
    expect(result.error).toContain('Block missing not found')
  })
})

