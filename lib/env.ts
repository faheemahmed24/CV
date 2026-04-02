import { z } from 'zod';

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  AUTH0_SECRET: z.string().min(1, "AUTH0_SECRET is required"),
  AUTH0_BASE_URL: z.string().url("AUTH0_BASE_URL must be a valid URL"),
  AUTH0_ISSUER_BASE_URL: z.string().url("AUTH0_ISSUER_BASE_URL must be a valid URL"),
  AUTH0_CLIENT_ID: z.string().min(1, "AUTH0_CLIENT_ID is required"),
  AUTH0_CLIENT_SECRET: z.string().min(1, "AUTH0_CLIENT_SECRET is required"),
  // DB is optional
  DB: z.any().optional(),
});

export const validateEnv = () => {
  try {
    envSchema.parse({
      GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY,
      AUTH0_SECRET: process.env.AUTH0_SECRET,
      AUTH0_BASE_URL: process.env.AUTH0_BASE_URL,
      AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL,
      AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
      AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
      DB: process.env.DB,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(e => e.path.join('.')).join(', ');
      throw new Error(`❌ Missing or invalid environment variables: ${missingVars}`);
    }
    throw error;
  }
};
