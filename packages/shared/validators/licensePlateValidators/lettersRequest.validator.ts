import { z } from 'zod'

const zLicensePlateLettersSchema = z.string().superRefine((val, ctx) => {
  // Check for length constraints
  if (val.length < 1 || val.length > 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Letters part must be 1-2 characters long.',
    })
    return
  }

  // Check for valid characters (letters A-Z)
  if (!/^[a-zA-Z]+$/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Letters part must only consist of letters (A-Z).',
    })
    return
  }
})

export default zLicensePlateLettersSchema
