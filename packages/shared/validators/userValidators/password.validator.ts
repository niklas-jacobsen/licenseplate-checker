import { z } from 'zod'

const zPasswordSchema = z.string().superRefine((val, ctx) => {
  // Check for minimum length of 12 characters
  if (val.length < 12) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Password must be at least 12 characters long',
    })
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Password must contain at least one uppercase letter',
    })
  }

  // Check for at least one digit
  if (!/[0-9]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Password must contain at least one number',
    })
  }

  // Check for at least one special character
  if (!/[^A-Za-z0-9]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Password must contain at least one special character',
    })
  }
})

export default zPasswordSchema
