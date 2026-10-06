import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform(Number),
  DATABASE_URL: z.string().default(
    process.env.DATABASE_URL ||
    'postgresql://postgres.mvaempwaprqjqdpmwrpf:etat-siap-pulih123@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
  ),

  JWT_ACCESS_SECRET: z.string().default(process.env.JWT_ACCESS_SECRET || 'etat_access_secret_dev_only'),
  JWT_REFRESH_SECRET: z.string().default(process.env.JWT_REFRESH_SECRET || 'etat_refresh_secret_dev_only'),
  JWT_ACCESS_EXPIRES: z.string().default('1h'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),

  MAX_FILE_SIZE_MB: z.string().default('10').transform(Number),
  UPLOAD_DIR: z.string().default('./uploads'),

  RESEND_API_KEY: z.string().default(process.env.RESEND_API_KEY || 're_3scnSJgX_3j5pykVskhVKnWjZZfD4XT89'),
  EMAIL_FROM: z.string().default('E-TAT POLRI <onboarding@resend.dev>'),
  EMAIL_SEKRETARIAT: z.string().default('etatsiappulih@gmail.com'),

  FRONTEND_URL: z.string().default('http://localhost:3000'),
  APP_URL: z.string().default('https://e-tat-backend.vercel.app'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.warn('⚠️ Environment variables warning:', parsed.error.flatten().fieldErrors);
}

export const env = parsed.success ? parsed.data : envSchema.parse({});
