import { chromium, Browser, Page } from 'playwright'
import type {
  BuilderIr,
  IrBlock,
  ActionOp,
  BranchCondition,
} from '@shared/builder-ir'
import {
  ExecutionLog,
  ExecutionResult,
  BlockNotFoundError,
  UnknownBlockKindError,
  BrowserInitializationError,
  UnknownActionTypeError,
  UnknownConditionOpError,
} from '@licenseplate-checker/shared/types'
import { EXECUTOR_ACTION_DELAY_MS } from '@licenseplate-checker/shared/constants/limits'
import {
  BLOCKED_URL_SCHEMES,
  PRIVATE_IP_RANGES,
  PRIVATE_HOSTNAMES,
} from '@licenseplate-checker/shared/constants/schemes'

export interface ExecutorOptions {
  allowedDomains?: string[]
}

export class IrExecutor {
  private logs: ExecutionLog[] = []
  private browser: Browser | null = null
  private page: Page | null = null
  private allowedDomains: string[]

  constructor(options: ExecutorOptions = {}) {
    this.allowedDomains = options.allowedDomains ?? []
  }

  private log(
    level: ExecutionLog['level'],
    message: string,
    details?: unknown
  ) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
    })
  }

  private validateUrl(url: string): void {
    const lower = url.toLowerCase()

    for (const scheme of BLOCKED_URL_SCHEMES) {
      if (lower.startsWith(scheme)) {
        throw new Error(`Blocked URL scheme: ${scheme}`)
      }
    }

    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      throw new Error(`Invalid URL: ${url}`)
    }

    const hostname = parsed.hostname

    for (const pattern of PRIVATE_IP_RANGES) {
      if (pattern.test(hostname)) {
        throw new Error(
          `Access to private network address is blocked: ${hostname}`
        )
      }
    }

    if (PRIVATE_HOSTNAMES.includes(hostname.toLowerCase())) {
      throw new Error(`Access to private host is blocked: ${hostname}`)
    }

    if (this.allowedDomains.length > 0) {
      const isAllowed = this.allowedDomains.some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
      )
      if (!isAllowed) {
        throw new Error(
          `Domain '${hostname}' is not in the allowed list: [${this.allowedDomains.join(', ')}]`
        )
      }
    }
  }

  private async delay(): Promise<void> {
    await new Promise((resolve) =>
      setTimeout(resolve, EXECUTOR_ACTION_DELAY_MS)
    )
  }

  async execute(ir: BuilderIr): Promise<ExecutionResult> {
    this.logs = []

    try {
      this.log('info', 'Starting execution', { entryBlockId: ir.entryBlockId })

      this.browser = await chromium.launch({ headless: true })
      this.page = await this.browser.newPage()

      await this.page.route('**/*', (route) => {
        const url = route.request().url()
        try {
          this.validateUrl(url)
          route.continue()
        } catch {
          this.log('warn', `Blocked outbound request: ${url}`)
          route.abort('blockedbyclient')
        }
      })

      let currentBlockId: string | null = ir.entryBlockId

      while (currentBlockId) {
        const block = ir.blocks[currentBlockId]

        if (!block) {
          throw new BlockNotFoundError(currentBlockId)
        }

        this.log('debug', `Executing block ${block.id}`, { kind: block.kind })

        currentBlockId = await this.executeBlock(block, ir)
      }

      this.log('info', 'Execution completed successfully')
      return { success: true, logs: this.logs }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      this.log('error', 'Execution failed', { error: errorMessage })
      return { success: false, logs: this.logs, error: errorMessage }
    } finally {
      if (this.browser) {
        await this.browser.close()
      }
    }
  }

  private async executeBlock(
    block: IrBlock,
    _ir: BuilderIr
  ): Promise<string | null> {
    switch (block.kind) {
      case 'start':
        return block.next

      case 'end':
        return null

      case 'action':
        await this.executeAction(block.op)
        await this.delay()
        return block.next

      case 'branch': {
        const conditionMet = await this.evaluateCondition(block.condition)
        this.log('info', `Branch condition evaluated to ${conditionMet}`)
        return conditionMet ? block.whenTrue : block.whenFalse
      }

      default:
        throw new UnknownBlockKindError((block as any).kind)
    }
  }

  private async executeAction(op: ActionOp): Promise<void> {
    if (!this.page) throw new BrowserInitializationError()

    switch (op.type) {
      case 'openPage':
        this.validateUrl(op.url)
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

      case 'waitDuration':
        this.log('info', `Waiting ${op.seconds}s`)
        await new Promise((resolve) =>
          setTimeout(resolve, op.seconds * 1000)
        )
        break

      case 'waitSelector':
        this.log('info', `Waiting for selector: ${op.selector}`)
        await this.page.waitForSelector(op.selector, {
          timeout: op.timeoutMs ?? 10000,
        })
        break

      case 'waitNewTab': {
        this.log('info', 'Waiting for new tab')
        const context = this.page.context()
        const newPage = await context.waitForEvent('page', {
          timeout: op.timeoutMs ?? 10000,
        })
        await newPage.waitForLoadState('domcontentloaded')
        await newPage.route('**/*', (route) => {
          const url = route.request().url()
          try {
            this.validateUrl(url)
            route.continue()
          } catch {
            this.log('warn', `Blocked outbound request: ${url}`)
            route.abort('blockedbyclient')
          }
        })
        this.page = newPage
        this.log('info', `Switched to new tab: ${newPage.url()}`)
        break
      }

      default:
        throw new UnknownActionTypeError((op as any).type)
    }
  }

  private async evaluateCondition(
    condition: BranchCondition
  ): Promise<boolean> {
    if (!this.page) throw new BrowserInitializationError()

    switch (condition.op) {
      case 'exists': {
        this.log('debug', `Checking if selector exists: ${condition.selector}`)
        const count = await this.page.locator(condition.selector).count()
        return count > 0
      }

      case 'textIncludes': {
        this.log(
          'debug',
          `Checking text in ${condition.selector} includes "${condition.value}"`
        )
        const text = await this.page.textContent(condition.selector)
        return text ? text.includes(condition.value) : false
      }

      default:
        throw new UnknownConditionOpError((condition as any).op)
    }
  }
}
