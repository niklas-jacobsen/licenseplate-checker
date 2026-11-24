import { z } from 'zod'
import zLicensePlateCitySchema from './licensePlateValidators/cityRequest.validator'
import zLicensePlateLettersSchema from './licensePlateValidators/lettersRequest.validator'
import zLicensePlateNumbersSchema from './licensePlateValidators/numbersRequest.validator'
import zPasswordSchema from './userValidators/password.validator'
import zWorkflowNameSchema from './workflowValidators/name.validator'
import zWorkflowDescriptionSchema from './workflowValidators/description.validator'

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

export { default as zWorkflowNameSchema } from './workflowValidators/name.validator'
export { default as zWorkflowDescriptionSchema } from './workflowValidators/description.validator'

export const zWorkflowMetaScheme = z.object({
  name: zWorkflowNameSchema,
  description: zWorkflowDescriptionSchema.optional(),
})

// zod 4 removed the message argument of .strict(); scope the custom message to
// unrecognized keys so other object-level issues keep zod's default wording.
const tooManyArguments = (issue: { code?: string }) =>
  issue.code === 'unrecognized_keys'
    ? 'Request contains too many arguments'
    : undefined

export const zUserScheme = z.strictObject(
  {
    email: z.string().email({ message: 'Invalid email address' }),
    password: zPasswordSchema,
  },
  { error: tooManyArguments }
)

export const zUserUpdateScheme = z.strictObject(
  {
    firstname: z
      .string()
      .min(2, { message: 'First name must be at least two characters' })
      .optional(),
    lastname: z
      .string()
      .min(2, { message: 'Last name must be at least two characters' })
      .optional(),
    email: z
      .string()
      .email({ message: 'Please enter a valid email address' })
      .optional(),
    street: z
      .string()
      .min(2, { message: 'Street must be at least two characters' })
      .optional(),
    streetNumber: z
      .string()
      .min(1, { message: 'House number is required' })
      .optional(),
    zipCode: z
      .string()
      .length(5, { message: 'Zip Code must be five characters' })
      .optional(),
    city: z
      .string()
      .min(2, { message: 'City must be at least two characters' })
      .optional(),
  },
  { error: tooManyArguments }
)
