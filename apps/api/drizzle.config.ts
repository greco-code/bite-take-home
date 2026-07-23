import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { config as loadEnvironment } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

const fromWorkingDirectory = (path: string) =>
  relative(process.cwd(), fileURLToPath(new URL(path, import.meta.url)));

loadEnvironment({
  path: fileURLToPath(new URL('.env', import.meta.url)),
  quiet: true,
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is required. Copy .env.example to .env and add your Neon connection string.',
  );
}

export default defineConfig({
  dialect: 'postgresql',
  schema: fromWorkingDirectory('src/database/schema.ts'),
  out: fromWorkingDirectory('drizzle'),
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
});
