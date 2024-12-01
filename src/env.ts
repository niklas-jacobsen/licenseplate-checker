import { z } from 'zod';

export const zEnvScheme = z.object({
  PORT: z.coerce.number().positive().int().default(8080),
  NODE_ENV: z
    .enum(['development', 'staging', 'production', 'test'])
    .default('development'),
  ALLOWED_ORIGINS: z
    .string()
    .min(1, 'ALLOWED_ORIGINS is required')
    .transform((origins) => origins.split(',').map((origin) => origin.trim())),
  DATABASE_URL: z.string().min(1, { message: 'DATABASE_URL is required' }),
  JWT_SECRET: z.string().min(1, { message: 'JWT_SECRET is required' }),
  FORCE_SEED: z.coerce.boolean().default(false),
  RATE_LIMIT_WINDOW: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
});

type IENV = z.infer<typeof zEnvScheme>;

export const ENV: IENV = zEnvScheme.parse(process.env);
