import { z } from 'zod'

export const IrVersionSchema = z.literal('v1')

export const ActionOpSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('openPage'), url: z.string().min(1) }),
  z.object({ type: z.literal('click'), selector: z.string().min(1) }),
  z.object({
    type: z.literal('typeText'),
    selector: z.string().min(1),
    text: z.string(),
  }),
  z.object({
    type: z.literal('waitDuration'),
    seconds: z.number().min(1).max(10),
  }),
  z.object({
    type: z.literal('waitSelector'),
    selector: z.string().min(1),
    timeoutMs: z.number().int().positive().optional(),
  }),
  z.object({
    type: z.literal('waitNewTab'),
    timeoutMs: z.number().int().positive().optional(),
  }),
  z.object({
    type: z.literal('selectByText'),
    selector: z.string().min(1),
    text: z.string().min(1),
  }),
  z.object({
    type: z.literal('selectByValue'),
    selector: z.string().min(1),
    value: z.string().min(1),
  }),
  z.object({
    type: z.literal('selectByIndex'),
    selector: z.string().min(1),
    index: z.number().int().min(0),
  }),
])

export const BranchConditionSchema = z.discriminatedUnion('op', [
  z.object({ op: z.literal('exists'), selector: z.string().min(1) }),
  z.object({
    op: z.literal('textIncludes'),
    selector: z.string().min(1),
    value: z.string().min(1),
  }),
])

export const IrStartBlockSchema = z.object({
  id: z.string().min(1),
  kind: z.literal('start'),
  sourceNodeId: z.string().min(1),
  next: z.string().min(1),
})

export const IrEndBlockSchema = z.object({
  id: z.string().min(1),
  kind: z.literal('end'),
  sourceNodeId: z.string().min(1),
})

export const IrActionBlockSchema = z.object({
  id: z.string().min(1),
  kind: z.literal('action'),
  sourceNodeId: z.string().min(1),
  op: ActionOpSchema,
  next: z.string().min(1),
})

export const IrBranchBlockSchema = z.object({
  id: z.string().min(1),
  kind: z.literal('branch'),
  sourceNodeId: z.string().min(1),
  condition: BranchConditionSchema,
  whenTrue: z.string().min(1),
  whenFalse: z.string().min(1),
})

export const IrBlockSchema = z.discriminatedUnion('kind', [
  IrStartBlockSchema,
  IrEndBlockSchema,
  IrActionBlockSchema,
  IrBranchBlockSchema,
])

export const BuilderIrSchema = z.object({
  irVersion: IrVersionSchema,
  registryVersion: z.string().min(1),
  entryBlockId: z.string().min(1),
  blocks: z.record(z.string(), IrBlockSchema),
  meta: z.record(z.string(), z.unknown()).optional(),
})
