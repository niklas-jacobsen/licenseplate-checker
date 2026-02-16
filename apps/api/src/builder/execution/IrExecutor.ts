import { chromium, Browser, Page } from '@playwright/test'
import type { BuilderIr, IrBlock, ActionOp, BranchCondition } from '@shared/builder-ir'

export type ExecutionLog = {
  timestamp: string
  level: 'info' | 'error' | 'debug'
  message: string
  details?: unknown
}

export type ExecutionResult = {
  success: boolean
  logs: ExecutionLog[]
  error?: string
}

export class IrExecutor {
  private logs: ExecutionLog[] = []
  private browser: Browser | null = null
  private page: Page | null = null

  private log(level: ExecutionLog['level'], message: string, details?: unknown) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
    })
  }

  async execute(ir: BuilderIr): Promise<ExecutionResult> {
    this.logs = []
    
    try {
      this.log('info', 'Starting execution', { entryBlockId: ir.entryBlockId })
      
      this.browser = await chromium.launch({ headless: true })
      this.page = await this.browser.newPage()
      
      let currentBlockId: string | null = ir.entryBlockId
      
      while (currentBlockId) {
        const block = ir.blocks[currentBlockId]
        
        if (!block) {
          throw new Error(`Block ${currentBlockId} not found`)
        }
        
        this.log('debug', `Executing block ${block.id}`, { kind: block.kind })
        
        currentBlockId = await this.executeBlock(block, ir)
      }
      
      this.log('info', 'Execution completed successfully')
      return { success: true, logs: this.logs }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log('error', 'Execution failed', { error: errorMessage })
      return { success: false, logs: this.logs, error: errorMessage }
    } finally {
      if (this.browser) {
        await this.browser.close()
      }
    }
  }

  private async executeBlock(block: IrBlock, ir: BuilderIr): Promise<string | null> {
    switch (block.kind) {
      case 'start':
        return block.next
        
      case 'end':
        return null
        
      case 'action':
        await this.executeAction(block.op)
        return block.next
        
      case 'branch':
        const conditionMet = await this.evaluateCondition(block.condition)
        this.log('info', `Branch condition evaluated to ${conditionMet}`)
        return conditionMet ? block.whenTrue : block.whenFalse
        
      default:
        throw new Error(`Unknown block kind: ${(block as any).kind}`)
    }
  }

  private async executeAction(op: ActionOp): Promise<void> {
    if (!this.page) throw new Error('Browser page not initialized')
    
    switch (op.type) {
      case 'openPage':
        this.log('info', `Opening page: ${op.url}`)
        await this.page.goto(op.url)
        await this.page.waitForLoadState('domcontentloaded')
        break
        
      case 'click':
        this.log('info', `Clicking selector: ${op.selector}`)
        await this.page.click(op.selector)
        break
        
      case 'typeText':
        this.log('info', `Typing text into ${op.selector}`)
        await this.page.fill(op.selector, op.text)
        break
        
      default:
        throw new Error(`Unknown action type: ${(op as any).type}`)
    }
  }

  private async evaluateCondition(condition: BranchCondition): Promise<boolean> {
    if (!this.page) throw new Error('Browser page not initialized')
    
    switch (condition.op) {
      case 'exists':
        this.log('debug', `Checking if selector exists: ${condition.selector}`)
        const count = await this.page.locator(condition.selector).count()
        return count > 0
        
      case 'textIncludes':
        this.log('debug', `Checking text in ${condition.selector} includes "${condition.value}"`)
        const text = await this.page.textContent(condition.selector)
        return text ? text.includes(condition.value) : false
        
      default:
        throw new Error(`Unknown condition op: ${(condition as any).op}`)
    }
  }
}
