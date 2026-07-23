import express from 'express';

import { configureApp } from './create-app.js';
import { readApiConfig } from './config.js';
import { createDatabase } from './database/client.js';
import { createCatalogRepository } from './features/catalog/catalog.repository.js';
import { createOrderRepository } from './features/order/order.repository.js';
import { createOrderService } from './features/order/order.service.js';

export const apiConfig = readApiConfig();
const database = createDatabase(apiConfig.databaseUrl);
const catalogRepository = createCatalogRepository(database);

export const app = configureApp(express(), {
  catalogRepository,
  orderService: createOrderService(
    catalogRepository,
    createOrderRepository(database),
  ),
  webOrigins: apiConfig.webOrigins,
});

export default app;
