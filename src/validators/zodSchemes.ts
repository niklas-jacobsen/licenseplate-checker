import { z } from "zod";

//allows only 1-3 letter strings with up to three "?" substitutions or instead a single "*" as a wildcard character
export const zLicensePlateCitySchema = z.string().refine(
  (val) =>
    (val.length >= 1 && val.length <= 3 && /^[a-zA-ZÖÜäöü\?]*$/.test(val)) ||
    val === "*", // Allows 1-3 letters, "?", or exactly "*"
  {
    message:
      "Input must be 1-3 characters long, with letters or '?', or '*' alone.",
  }
);

//allows only 1-2 letter strings with up to two "?" substitutions or instead a single "*" as a wildcard character
export const zLicensePlateLettersSchema = z.string().refine(
  (val) =>
    (val.length >= 1 && val.length <= 2 && /^[a-zA-Z\?]*$/.test(val)) ||
    val === "*", // Allows 1-2 letters, "?", or exactly "*"
  {
    message:
      "Input must be 1-2 characters long, with letters or '?', or '*' alone.",
  }
);

//allows 1-4 letter strings containing only numbers
//with up to four "?" substitutions or instead a single "*" as a wildcard character
export const zLicensePlateNumbersSchema = z.string().refine(
  (val) =>
    (val.length >= 1 && val.length <= 4 && /^[1-9\?]*$/.test(val)) ||
    val === "*", // Allow numbers (1-9), "?" or exactly "*"
  {
    message:
      "Input must be 1-4 characters long, with numbers (1-9) or '?', or '*' alone.",
  }
);

export const zRequestScheme = z.object({
  city: zLicensePlateCitySchema,
  letters: zLicensePlateLettersSchema,
  numbers: zLicensePlateNumbersSchema,
});

export const zPlateIdScheme = z.object({
  id: zRequestScheme,
});

export const zResponseScheme = z.object({
  city: z.string(),
  letters: z.string(),
  numbers: z.number(),
});
