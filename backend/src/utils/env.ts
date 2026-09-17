import 'dotenv/config';
import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_NAME: z.string().default('kojurebi_token'),
  PORT: z.coerce.number().default(45322),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGIN: z.string().default('http://127.0.0.1:45321'),
  FRONTEND_URL: z.string().default('http://127.0.0.1:45321'),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_UPLOAD_BYTES: z.coerce.number().default(8_388_608),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
