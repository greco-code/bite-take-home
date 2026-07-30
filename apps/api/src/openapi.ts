import { createDocument } from 'zod-openapi';

import {
  apiErrorResponseSchema,
  createOrderRequestSchema,
  createOrderResponseSchema,
  healthResponseSchema,
  orderAccessHeadersSchema,
  orderParamsSchema,
  orderPreviewResponseSchema,
  orderResponseSchema,
  previewOrderRequestSchema,
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
        description: 'Catalog products and their current ordering status.',
      },
      {
        name: 'Orders',
        description: 'Anonymous order checkout and receipt retrieval.',
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
                'Catalog products in configured display order, including current availability.',
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
      '/v1/orders': {
        post: {
          operationId: 'createOrder',
          summary: 'Complete an order',
          tags: ['Orders'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: createOrderRequestSchema,
              },
            },
          },
          responses: {
            '201': {
              description:
                'Order completed. The receipt token is only returned here.',
              content: {
                'application/json': {
                  schema: createOrderResponseSchema,
                },
              },
            },
            '400': {
              description: 'Invalid cart lines.',
              content: {
                'application/json': {
                  schema: apiErrorResponseSchema,
                },
              },
            },
            '409': {
              description:
                'The reviewed order changed or no products remain available.',
              content: {
                'application/json': {
                  schema: apiErrorResponseSchema,
                },
              },
            },
            '413': {
              description: 'Request body exceeds the configured size limit.',
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
      '/v1/orders/preview': {
        post: {
          operationId: 'previewOrder',
          summary: 'Review live order availability and pricing',
          tags: ['Orders'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: previewOrderRequestSchema,
              },
            },
          },
          responses: {
            '200': {
              description: 'Live review of all proposed cart lines.',
              content: {
                'application/json': {
                  schema: orderPreviewResponseSchema,
                },
              },
            },
            '400': {
              description: 'Invalid cart lines.',
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
      '/v1/orders/{orderId}': {
        get: {
          operationId: 'getOrder',
          summary: 'Retrieve an anonymous order receipt',
          tags: ['Orders'],
          requestParams: {
            path: orderParamsSchema,
            header: orderAccessHeadersSchema,
          },
          responses: {
            '200': {
              description: 'Completed order receipt.',
              content: {
                'application/json': {
                  schema: orderResponseSchema,
                },
              },
            },
            '400': {
              description: 'Invalid order ID or missing receipt token.',
              content: {
                'application/json': {
                  schema: apiErrorResponseSchema,
                },
              },
            },
            '404': {
              description: 'Order or matching receipt token was not found.',
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
