import dotenv from 'dotenv';

dotenv.config();

const required = (value: string | undefined, name: string) => {
  if (!value) throw new Error(`Missing required env var ${name}`);
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: required(process.env.CLIENT_ORIGIN, 'CLIENT_ORIGIN'),
  jwtSecret: required(process.env.JWT_SECRET, 'JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  uploadDir: process.env.UPLOAD_DIR ?? 'uploads',
  databaseUrl: process.env.DATABASE_URL ?? ''
};

