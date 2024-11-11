import { z } from 'zod';

const zBirthdateSchema = z.date().superRefine((val, ctx) => {
  // Birthdate validations
  const today = new Date();
  if (val > today) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Birthdate cannot be in the future',
    });
  }

  // Check for overly old birthdates
  const oldestDate = new Date(1900, 0, 1);
  if (val < oldestDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'You are not that old!',
    });
  }
});

export default zBirthdateSchema;
