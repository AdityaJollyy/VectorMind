import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8080),
  CLIENT_URL: z.url().default('http://localhost:5173'),

  // Database
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // Auth
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),

  // Gemini (via OpenAI-compatible endpoint)
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GEMINI_BASE_URL: z.url().default('https://generativelanguage.googleapis.com/v1beta/openai/'),
  GEMINI_CHAT_MODEL: z.string().default('gemini-3.1-flash-lite'),
  GEMINI_SUMMARY_MODEL: z.string().default('gemini-2.5-flash-lite'),
  GEMINI_EMBEDDING_MODEL: z.string().default('gemini-embedding-001'),
  EMBEDDING_DIMENSIONS: z.coerce.number().default(768),

  // Qdrant
  QDRANT_URL: z.url(),
  QDRANT_API_KEY: z.string().min(1, 'QDRANT_API_KEY is required'),
  QDRANT_COLLECTION: z.string().default('notebooklm_chunks'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  for (const issue of parsed.error.issues) {
    console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';
