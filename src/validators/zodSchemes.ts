import { z } from 'zod';
import zLicensePlateCitySchema from './licensePlateValidators/cityRequest.validator';
import zLicensePlateLettersSchema from './licensePlateValidators/lettersRequest.validator';
import zLicensePlateNumbersSchema from './licensePlateValidators/numbersRequest.validator';
import zBirthdateSchema from './userValidators/birthdate.validator';
import zPasswordSchema from './userValidators/password.validator';

const SalutationEnum = z.enum([
  'HERR',
  'FRAU',
  'FIRMA',
  'VEREIN',
  'JURISTISCHE_PERSON',
]);

export const zRequestScheme = z
  .object({
    city: zLicensePlateCitySchema,
    letters: zLicensePlateLettersSchema,
    numbers: zLicensePlateNumbersSchema,
  })
  .superRefine((data, ctx) => {
    // Check for double wildcard
    if (data.letters == '*' && data.numbers == '*') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Request too broad. Wildcard character '*' not allowed for both letters and numbers",
      });
    }

    // Check if letters is '*' and numbers contains more than three '?'
    if (data.letters === '*' && (data.numbers.match(/\?/g) || []).length > 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Request too broad. 'numbers' cannot contain more than three '?' when 'letters' is '*'",
      });
    }
  });

export const zPlateIdScheme = z.object({
  id: zRequestScheme,
});

export const zResponseScheme = z.object({
  city: z.string(),
  letters: z.string(),
  numbers: z.number(),
});

export const zUserScheme = z
  .object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: zPasswordSchema,
  })
  .strict({ message: 'Request contains too many arguments' });
