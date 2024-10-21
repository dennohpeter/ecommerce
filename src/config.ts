import 'dotenv/config';
import { check } from './helpers';

// Check if all required environment variables are set
[
  'POSTGRES_USER',
  'JWT_SECRET',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
  'POSTGRES_HOST',
  'POSTGRES_PORT',
].map(check);

export const config = {
  user: process.env.POSTGRES_USER!,
  host: process.env.POSTGRES_HOST!,
  database: process.env.POSTGRES_DB!,
  password: process.env.POSTGRES_PASSWORD!,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  jwtSecret: process.env.JWT_SECRET!,
};
