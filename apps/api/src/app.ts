import cors from 'cors';
import express, {
  type ErrorRequestHandler,
  type Express,
  type RequestHandler,
} from 'express';
import swaggerUi from 'swagger-ui-express';

import { apiErrorResponseSchema, healthResponseSchema } from '@bite/contracts';

import { type CatalogRepository } from './features/catalog/catalog.repository.js';
import { createCatalogRouter } from './features/catalog/catalog.routes.js';
import { createOrderRouter } from './features/order/order.routes.js';
import { type OrderService } from './features/order/order.service.js';
import { openApiDocument } from './openapi.js';

type AppDependencies = Readonly<{
  catalogRepository: CatalogRepository;
  orderService: OrderService;
  webOrigins: string[];
}>;

const createCorsMiddleware = (webOrigins: string[]): RequestHandler => {
  const allowedOrigins = new Set(webOrigins);

  return cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.has(origin));
    },
  });
};

const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  console.error(
    'Unhandled API error:',
    error instanceof Error ? error.message : 'Unknown error',
  );
  response.status(500).json(
    apiErrorResponseSchema.parse({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.',
      },
    }),
  );
};

export const createApp = ({
  catalogRepository,
  orderService,
  webOrigins,
}: AppDependencies): Express => {
  const app = express();

  app.disable('x-powered-by');
  app.use(createCorsMiddleware(webOrigins));
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_request, response) => {
    response.json(healthResponseSchema.parse({ status: 'ok' }));
  });

  app.get('/openapi.json', (_request, response) => {
    response.json(openApiDocument);
  });

  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customSiteTitle: 'Bite API documentation',
    }),
  );

  app.use('/v1/products', createCatalogRouter(catalogRepository));
  app.use('/v1/orders', createOrderRouter(orderService));

  app.use(errorHandler);

  return app;
};
