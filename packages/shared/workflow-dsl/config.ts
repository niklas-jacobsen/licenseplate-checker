import { z } from 'zod'

//Node Configs

//Open Page
export const OpenPageNodeConfig = z.object({
  url: z.string().url(),
})

//Click
export const ClickNodeConfig = z.object({
  selector: z.string().min(1),
})

//Type Text
export const TypeTextNodeConfig = z.object({
  selector: z.string().min(1),
  text: z.string(),
})

//Conditional
export const ConditionalNodeConfig = z.discriminatedUnion('operator', [
  z.object({
    operator: z.literal('exists'),
    selector: z.string().min(1),
  }),
  z.object({
    operator: z.literal('textIncludes'),
    selector: z.string().min(1),
    value: z.string().min(1),
  }),
])

//Start and End
export const StartNodeConfig = z.object({})
export const EndNodeConfig = z.object({})

//Export Types
export type OpenPageConfig = z.infer<typeof OpenPageNodeConfig>
export type ClickConfig = z.infer<typeof ClickNodeConfig>
export type TypeTextConfig = z.infer<typeof TypeTextNodeConfig>
export type ConditionalConfig = z.infer<typeof ConditionalNodeConfig>
