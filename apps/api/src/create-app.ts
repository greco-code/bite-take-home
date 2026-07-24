import cors from 'cors';
import express, {
  type ErrorRequestHandler,
  type Express,
  type RequestHandler,
} from 'express';

import { apiErrorResponseSchema, healthResponseSchema } from '@bite/contracts';

import { type CatalogRepository } from './features/catalog/catalog.repository.js';
import { createCatalogRouter } from './features/catalog/catalog.routes.js';
import { createOrderRouter } from './features/order/order.routes.js';
import { type OrderService } from './features/order/order.service.js';
import { openApiDocsHtml } from './openapi-docs.js';
import { openApiDocument } from './openapi.js';

type AppDependencies = Readonly<{
  catalogRepository: CatalogRepository;
  orderService: OrderService;
  webOrigins: string[];
}>;

type RequestBodyErrorResponse = Readonly<{
  message: string;
  status: 400 | 413;
}>;

const createCorsMiddleware = (webOrigins: string[]): RequestHandler => {
  const allowedOrigins = new Set(webOrigins);

  return cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.has(origin));
    },
  });
};

const getRequestBodyErrorResponse = (
  error: unknown,
): RequestBodyErrorResponse | null => {
  if (
    typeof error !== 'object' ||
    error === null ||
    !('status' in error) ||
    !('type' in error)
  ) {
    return null;
  }

  if (error.status === 400 && error.type === 'entity.parse.failed') {
    return {
      message: 'Request body contains invalid JSON.',
      status: 400,
    };
  }

  if (error.status === 413 && error.type === 'entity.too.large') {
    return {
      message: 'Request body is too large.',
      status: 413,
    };
  }

  return null;
};

const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  const requestBodyError = getRequestBodyErrorResponse(error);

  if (requestBodyError) {
    response.status(requestBodyError.status).json(
      apiErrorResponseSchema.parse({
        error: {
          code: 'INVALID_REQUEST',
          message: requestBodyError.message,
        },
      }),
    );
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

export const configureApp = (
  app: Express,
  { catalogRepository, orderService, webOrigins }: AppDependencies,
): Express => {
  app.disable('x-powered-by');
  app.use(createCorsMiddleware(webOrigins));
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_request, response) => {
    response.json(healthResponseSchema.parse({ status: 'ok' }));
  });

  app.get('/openapi.json', (_request, response) => {
    response.json(openApiDocument);
  });

  app.get('/docs', (_request, response) => {
    response.type('html').send(openApiDocsHtml);
  });

  app.use('/v1/products', createCatalogRouter(catalogRepository));
  app.use('/v1/orders', createOrderRouter(orderService));

  app.use(errorHandler);

  return app;
};

export const createApp = (dependencies: AppDependencies): Express =>
  configureApp(express(), dependencies);
