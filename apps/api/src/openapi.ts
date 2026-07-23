import { createDocument } from 'zod-openapi';

import {
  apiErrorResponseSchema,
  healthResponseSchema,
  productListResponseSchema,
  productParamsSchema,
  productSchema,
} from '@bite/contracts';

export const openApiDocument: ReturnType<typeof createDocument> =
  createDocument({
    openapi: '3.1.0',
    info: {
      title: 'Bite API',
      version: '1.0.0',
      description: 'HTTP API for the Bite ordering application.',
    },
    servers: [
      {
        url: '/',
        description: 'Current API origin',
      },
    ],
    tags: [
      {
        name: 'System',
        description: 'Service health endpoints.',
      },
      {
        name: 'Catalog',
        description: 'Products available for ordering.',
      },
    ],
    paths: {
      '/health': {
        get: {
          operationId: 'getHealth',
          summary: 'Check API health',
          tags: ['System'],
          responses: {
            '200': {
              description: 'API is healthy.',
              content: {
                'application/json': {
                  schema: healthResponseSchema,
                },
              },
            },
          },
        },
      },
      '/v1/products': {
        get: {
          operationId: 'listProducts',
          summary: 'List products',
          tags: ['Catalog'],
          responses: {
            '200': {
              description:
                'Available products in configured catalog display order.',
              content: {
                'application/json': {
                  schema: productListResponseSchema,
                },
              },
            },
            '500': {
              description: 'Unexpected server error.',
              content: {
                'application/json': {
                  schema: apiErrorResponseSchema,
                },
              },
            },
          },
        },
      },
      '/v1/products/{productId}': {
        get: {
          operationId: 'getProduct',
          summary: 'Get a product',
          tags: ['Catalog'],
          requestParams: {
            path: productParamsSchema,
          },
          responses: {
            '200': {
              description: 'Requested product.',
              content: {
                'application/json': {
                  schema: productSchema,
                },
              },
            },
            '400': {
              description: 'Invalid product identifier.',
              content: {
                'application/json': {
                  schema: apiErrorResponseSchema,
                },
              },
            },
            '404': {
              description: 'Product was not found.',
              content: {
                'application/json': {
                  schema: apiErrorResponseSchema,
                },
              },
            },
            '500': {
              description: 'Unexpected server error.',
              content: {
                'application/json': {
                  schema: apiErrorResponseSchema,
                },
              },
            },
          },
        },
      },
    },
  });
