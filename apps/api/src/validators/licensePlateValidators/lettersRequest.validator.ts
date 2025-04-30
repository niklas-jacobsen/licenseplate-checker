import { z } from 'zod'

//allows 1-4 digit strings with no leading zeroes, up to four "?" substitutions or instead a single "*" as a wildcard character
const zLicensePlateLettersSchema = z.string().superRefine((val, ctx) => {
  // Allow the special case of a single "*"
  if (val === '*') {
    return
  }

  // Check for length constraints
  if (val.length !== 1 && val.length !== 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Input must be 1-2 characters long.',
    })
    return
  }

  // Check for valid characters (letters Aa-Zz and "?")
  if (!/^[a-zA-Z\?]{1,2}$/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Input must only consist of letters (Aa-Zz) or '?'.",
    })
    return
  }
})

export default zLicensePlateLettersSchema
