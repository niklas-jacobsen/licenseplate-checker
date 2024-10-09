import { z } from "zod";

//allows only a 1-3 letter string
export const zLicensePlateCitySchema = z.string().superRefine((val, ctx) => {
  // Check for length constraints
  if (val.length < 1 || val.length > 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Input must be 1-3 characters long.",
    });
    return;
  }

  // Check for valid characters (digits 0-9 and "?")
  if (!/^[a-zA-ZÄÖÜäöü]*$/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Input must only consist of letters",
    });
    return;
  }
});
