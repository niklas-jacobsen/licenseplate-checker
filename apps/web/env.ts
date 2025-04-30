import { z } from 'zod'

export const zEnvScheme = z.object({
  NEXT_PUBLIC_BACKEND_URL: z
    .string()
    .min(1, { message: 'BACKEND_URL is required' }),
})

type IENV = z.infer<typeof zEnvScheme>

export const ENV: IENV = zEnvScheme.parse(process.env)
