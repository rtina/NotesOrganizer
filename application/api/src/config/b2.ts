import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env";

export const isB2Configured =
  !!env.B2_S3_ENDPOINT &&
  !!env.B2_REGION &&
  !!env.B2_ACCESS_KEY_ID &&
  !!env.B2_SECRET_ACCESS_KEY &&
  !!env.B2_BUCKET;

export const b2 = new S3Client({
  region: env.B2_REGION || "us-west-004",
  endpoint: env.B2_S3_ENDPOINT || undefined,
  credentials: env.B2_ACCESS_KEY_ID
    ? {
        accessKeyId: env.B2_ACCESS_KEY_ID,
        secretAccessKey: env.B2_SECRET_ACCESS_KEY,
      }
    : undefined,
});