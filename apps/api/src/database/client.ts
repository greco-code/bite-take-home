import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema.js';

export const createDatabase = (databaseUrl: string) =>
  drizzle(databaseUrl, { schema });

export type Database = ReturnType<typeof createDatabase>;
