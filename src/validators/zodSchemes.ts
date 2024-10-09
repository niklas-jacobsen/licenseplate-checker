import { z } from "zod";
import { zLicensePlateCitySchema } from "./licensePlateValidators/cityRequest.validator";
import { zLicensePlateLettersSchema } from "./licensePlateValidators/lettersRequest.validator";
import { zLicensePlateNumbersSchema } from "./licensePlateValidators/numbersRequest.validator";

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
