import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { DEFAULT_DATABASE_URL } from './src/config/env';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'] ?? DEFAULT_DATABASE_URL,
  },
});
