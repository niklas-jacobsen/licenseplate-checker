import type { z } from 'zod'
import type {
  ActionOpSchema,
  BranchConditionSchema,
  BuilderIrSchema,
  IrBlockSchema,
} from './ir.schema'

export type BuilderIr = z.infer<typeof BuilderIrSchema>
export type IrBlock = z.infer<typeof IrBlockSchema>

export type ActionOp = z.infer<typeof ActionOpSchema>
export type BranchCondition = z.infer<typeof BranchConditionSchema>
