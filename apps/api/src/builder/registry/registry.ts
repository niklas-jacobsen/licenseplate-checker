import { z } from 'zod'
import type { CoreNodeType } from '@shared/workflow-dsl'

export const PortSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
})

export const NodeSpecSchema = z.object({
  type: z.custom<CoreNodeType>(),
  label: z.string(),
  category: z.string(),

  inputs: z.array(PortSchema),
  outputs: z.array(PortSchema),

  //Validates that the value is a Zod schema instance.
  propsSchema: z.custom<z.ZodTypeAny>(
    (val) => !!val && typeof (val as any).safeParse === 'function',
    { message: 'Must be a Zod schema' }
  ),
})

export type NodeSpec = z.infer<typeof NodeSpecSchema>
