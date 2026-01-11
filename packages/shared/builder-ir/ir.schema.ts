import { z } from 'zod'

export const IrVersionSchema = z.literal('v1')

export const ActionOpSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('openPage'), url: z.string().url() }),
  z.object({ type: z.literal('click'), selector: z.string().min(1) }),
  z.object({
    type: z.literal('typeText'),
    selector: z.string().min(1),
    text: z.string(),
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
