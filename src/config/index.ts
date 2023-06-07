import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const {
  NODE_ENV,
  HOST,
  PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_DATABASE,
  DB_CONNECTION_STRING,
  SECRET_KEY,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,

  FROM_EMAIL,
  EMAIL_USER,
  EMAIL_PASSWORD,

  S3_BUCKET,
  S3_BUCKET_FOLDER_USERS,
  S3_CDN_ENDPOINT,

  AWS_SECRET_KEY,
  AWS_ACCESS_KEY,
  AWS_REGION,

  GOOGLE_CLIENT_ID,
  ANDROID_GOOGLE_CLIENT_ID,
  APPLE_CLIENT_ID,
} = process.env;
