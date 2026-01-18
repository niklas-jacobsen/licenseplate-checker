import { z } from 'zod'

const zLicensePlateCitySchema = z.string().superRefine((val, ctx) => {
  // Check for length constraints
  if (val.length < 1 || val.length > 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'City code must be 1-3 characters long.',
    })
    return
  }

  // Check for valid characters (letters A-Z, ÄÖÜ)
  if (!/^[a-zA-ZÄÖÜäöü]+$/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'City code must only consist of letters.',
    })
    return
  }
})

export default zLicensePlateCitySchema
