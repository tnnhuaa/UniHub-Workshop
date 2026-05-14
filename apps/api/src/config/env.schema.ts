import { z } from 'zod/v4';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:5173,http://127.0.0.1:5173'),
  DATABASE_URL: z.url(),
  DIRECT_URL: z.url(),
  REDIS_URL: z.string().min(1),
  RABBITMQ_URL: z.string().url().default('amqp://localhost:5672'),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_JWT_ISSUER: z.string().default('unihub-api'),
  BETTER_AUTH_JWT_AUDIENCE: z.string().default('unihub-mobile'),
  BETTER_AUTH_JWT_TTL: z.string().default('15m'),
  BETTER_AUTH_SESSION_TTL: z.string().default('30d'),
  GOOGLE_OAUTH_CLIENT_ID: z.string(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string(),
  GOOGLE_OAUTH_REDIRECT_URI: z.url().optional(),
  GEMINI_API_KEY: z.string().min(1),
  CSV_DROP_LOCATION: z.string().default('/tmp/csv-drop'),
  CSV_SYNC_TIMEZONE: z.string().default('UTC'),
  DOCUMENT_STORAGE_PATH: z.string().default('/tmp/unihub-documents'),
});

export type Env = z.infer<typeof envSchema>;
