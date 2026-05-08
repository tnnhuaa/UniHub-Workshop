import { z } from 'zod/v4';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.url(),
  DIRECT_URL: z.url(),
});

export type Env = z.infer<typeof envSchema>;
