import { z } from 'zod'
import zLicensePlateCitySchema from './licensePlateValidators/cityRequest.validator'
import zLicensePlateLettersSchema from './licensePlateValidators/lettersRequest.validator'
import zLicensePlateNumbersSchema from './licensePlateValidators/numbersRequest.validator'
import zPasswordSchema from './userValidators/password.validator'

export const zLicensePlateScheme = z.object({
  city: zLicensePlateCitySchema,
  letters: zLicensePlateLettersSchema,
  numbers: zLicensePlateNumbersSchema,
})

export const zCheckRequestScheme = zLicensePlateScheme.extend({
  workflowId: z.string().optional(),
})

export default zLicensePlateScheme

export const zPlateIdScheme = z.object({
  id: zLicensePlateScheme,
})

export const zResponseScheme = z.object({
  city: z.string(),
  letters: z.string(),
  numbers: z.number(),
})

export const zUserScheme = z
  .object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: zPasswordSchema,
  })
  .strict({ message: 'Request contains too many arguments' })

export const zUserUpdateScheme = z
  .object({
    firstname: z
      .string()
      .min(2, { message: 'First name must be at least two characters' })
      .or(z.undefined()),
    lastname: z
      .string()
      .min(2, { message: 'Last name must be at least two characters' })
      .or(z.undefined()),
    email: z
      .string()
      .email({ message: 'Please enter a valid email address' })
      .or(z.undefined()),
    street: z
      .string()
      .min(2, { message: 'Street must be at least two characters' })
      .or(z.undefined()),
    streetNumber: z
      .string()
      .min(1, { message: 'House number is required' })
      .or(z.undefined()),
    zipCode: z
      .string()
      .length(5, { message: 'Zip Code must be five characters' })
      .or(z.undefined()),
    city: z
      .string()
      .min(2, { message: 'City must be at least two characters' })
      .or(z.undefined()),
  })
  .strict({ message: 'Request contains too many arguments' })
