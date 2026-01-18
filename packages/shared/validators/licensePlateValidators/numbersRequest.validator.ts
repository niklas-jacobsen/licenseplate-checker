import { z } from 'zod'

const zLicensePlateNumbersSchema = z.string().superRefine((val, ctx) => {
  // Check for length constraints
  if (val.length < 1 || val.length > 4) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Numbers part must be 1-4 digits long.',
    })
    return
  }

  // Check for leading zeros
  if (/^0/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Numbers cannot start with a zero.',
    })
    return
  }

  // Check for valid characters (digits 0-9 only)
  if (!/^[0-9]+$/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Numbers part must only consist of digits (0-9).',
    })
    return
  }
})

export default zLicensePlateNumbersSchema
