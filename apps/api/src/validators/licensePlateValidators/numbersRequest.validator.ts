import { z } from 'zod'

//allows 1-4 digit strings with no leading zeroes, up to four "?" substitutions or instead a single "*" as a wildcard character
const zLicensePlateNumbersSchema = z.string().superRefine((val, ctx) => {
  // Allow the special case of a single "*"
  if (val === '*') {
    return
  }

  // Check for length constraints
  if (val.length < 1 || val.length > 4) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Input must be 1-4 characters long.',
    })
    return
  }

  // Check for leading zeros (only applies to numeric inputs, not '?')
  if (/^0/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Input cannot have leading zeros.',
    })
    return
  }

  // Check for valid characters (digits 0-9 and "?")
  if (!/^[0-9\?]{1,4}$/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Input must only consist of digits (0-9) or '?' with no leading zeros.",
    })
    return
  }
})

export default zLicensePlateNumbersSchema
