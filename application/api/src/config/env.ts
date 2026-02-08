import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.string().optional().default("development"),
  PORT: z.string().optional().default("4000"),
  CORS_ORIGIN: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(20),
  JWT_REFRESH_SECRET: z.string().min(20),
  ACCESS_TOKEN_EXPIRES_IN: z.string().optional().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().optional().default("30d"),

  DATABASE_URL: z.string().min(10),

  // Backblaze B2 (S3 compatible)
  B2_S3_ENDPOINT: z.string().optional().default(""),
  B2_REGION: z.string().optional().default(""),
  B2_ACCESS_KEY_ID: z.string().optional().default(""),
  B2_SECRET_ACCESS_KEY: z.string().optional().default(""),
  B2_BUCKET: z.string().optional().default(""),
  B2_PUBLIC_BASE_URL: z.string().optional().default(""),
});

export const env = EnvSchema.parse(process.env);
export type Env = z.infer<typeof EnvSchema>;