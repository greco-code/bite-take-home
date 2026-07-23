import { createApp } from './app.js';
import { readApiConfig } from './config.js';
import { createDatabase } from './database/client.js';
import { createCatalogRepository } from './features/catalog/catalog.repository.js';

export const apiConfig = readApiConfig();
const database = createDatabase(apiConfig.databaseUrl);

export const app = createApp({
  catalogRepository: createCatalogRepository(database),
  webOrigins: apiConfig.webOrigins,
});

export default app;
