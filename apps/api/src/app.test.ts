import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { type Order, type Product } from '@bite/contracts';

import { createApp } from './create-app.js';
import { type CatalogRepository } from './features/catalog/catalog.repository.js';
import { type OrderService } from './features/order/order.service.js';

const products: Product[] = [
  {
    id: '1',
    name: 'Maine Root-Cola',
    description: 'Classic pizza with fresh mozzarella and basil.',
    price: 395,
    imageUrl:
      'https://assets.admin.getabite.co/items/olo/6217611-1563923718946.jpg',
    status: 'available',
  },
  {
    id: '2',
    name: 'Super Taco Salad (New!)',
    description:
      'A super taco salad with black beans, corn, avocado, salsa, and tortilla strips.',
    price: 1125,
    imageUrl:
      'https://assets.admin.getabite.co/items/olo/7420856-1563923722357.jpg',
    status: 'unavailable',
  },
];

const catalogRepository: CatalogRepository = {
  async findProductById(productId) {
    return products.find((product) => product.id === productId) ?? null;
  },
  async findProductsByIds(productIds) {
    return products.filter((product) => productIds.includes(product.id));
  },
  async listProducts() {
    return products;
  },
};

const order: Order = {
  id: 'fd150cbc-9737-43e7-80dd-2f6789839106',
  total: 790,
  createdAt: '2026-07-23T19:00:00.000Z',
  lines: [
    {
      position: 1,
      productId: '1',
      name: 'Maine Root-Cola',
      unitPrice: 395,
      quantity: 2,
      lineTotal: 790,
    },
  ],
};
const receiptToken = 'a'.repeat(43);
const reviewToken = 'b'.repeat(64);
const orderService: OrderService = {
  async createOrder(input) {
    if (input.lines.some((line) => line.productId === 'missing')) {
      return { status: 'review-required' };
    }

    return {
      status: 'created',
      response: {
        order,
        receiptToken,
      },
    };
  },
  async findOrder(orderId, token) {
    return orderId === order.id && token === receiptToken ? order : null;
  },
  async previewOrder(input) {
    const lines = input.lines.map((line, index) => {
      const product = products.find((item) => item.id === line.productId);

      if (!product || product.status === 'unavailable') {
        return {
          status: 'unavailable' as const,
          position: index + 1,
          productId: line.productId,
        };
      }

      return {
        status: 'available' as const,
        position: index + 1,
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: line.quantity,
        lineTotal: product.price * line.quantity,
      };
    });

    return {
      lines,
      total: lines.reduce(
        (total, line) =>
          line.status === 'available' ? total + line.lineTotal : total,
        0,
      ),
      reviewToken,
    };
  },
};

const app = createApp({
  catalogRepository,
  orderService,
  webOrigins: ['http://localhost:3000'],
});

describe('Bite API', () => {
  it('reports its health', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body).toEqual({ status: 'ok' });
  });

  it('lists products', async () => {
    const response = await request(app).get('/v1/products').expect(200);

    expect(response.body).toEqual(products);
  });

  it('returns one product', async () => {
    const response = await request(app).get('/v1/products/2').expect(200);

    expect(response.body).toEqual(products[1]);
  });

  it('completes an order', async () => {
    const response = await request(app)
      .post('/v1/orders')
      .send({
        lines: [{ productId: '1', quantity: 2 }],
        reviewToken,
        acceptUnavailableExclusions: true,
      })
      .expect(201);

    expect(response.body).toEqual({ order, receiptToken });
  });

  it('rejects an empty order', async () => {
    const response = await request(app)
      .post('/v1/orders')
      .send({ lines: [] })
      .expect(400);

    expect(response.body.error.code).toBe('INVALID_REQUEST');
  });

  it('reports malformed JSON as an invalid request', async () => {
    const response = await request(app)
      .post('/v1/orders')
      .set('Content-Type', 'application/json')
      .send('{"lines":')
      .expect(400);

    expect(response.body).toEqual({
      error: {
        code: 'INVALID_REQUEST',
        message: 'Request body contains invalid JSON.',
      },
    });
  });

  it('rejects request bodies larger than the configured limit', async () => {
    const response = await request(app)
      .post('/v1/orders')
      .set('Content-Type', 'application/json')
      .send(
        JSON.stringify({
          lines: [{ productId: '1', quantity: 1 }],
          padding: 'x'.repeat(1_048_576),
        }),
      )
      .expect(413);

    expect(response.body).toEqual({
      error: {
        code: 'INVALID_REQUEST',
        message: 'Request body is too large.',
      },
    });
  });

  it('rejects an order containing an unavailable product', async () => {
    const response = await request(app)
      .post('/v1/orders')
      .send({
        lines: [{ productId: 'missing', quantity: 1 }],
        reviewToken,
        acceptUnavailableExclusions: true,
      })
      .expect(409);

    expect(response.body.error.code).toBe('ORDER_REVIEW_REQUIRED');
  });

  it('previews available and unavailable cart lines', async () => {
    const response = await request(app)
      .post('/v1/orders/preview')
      .send({
        lines: [
          { productId: '1', quantity: 2 },
          { productId: '2', quantity: 1 },
          { productId: 'missing', quantity: 1 },
        ],
      })
      .expect(200);

    expect(response.body).toEqual({
      lines: [
        {
          status: 'available',
          position: 1,
          productId: '1',
          name: 'Maine Root-Cola',
          unitPrice: 395,
          quantity: 2,
          lineTotal: 790,
        },
        { status: 'unavailable', position: 2, productId: '2' },
        { status: 'unavailable', position: 3, productId: 'missing' },
      ],
      total: 790,
      reviewToken,
    });
  });

  it('retrieves an order with its receipt token', async () => {
    const response = await request(app)
      .get(`/v1/orders/${order.id}`)
      .set('x-order-token', receiptToken)
      .expect(200);

    expect(response.body).toEqual(order);
  });

  it('does not retrieve an order with a different receipt token', async () => {
    const response = await request(app)
      .get(`/v1/orders/${order.id}`)
      .set('x-order-token', 'b'.repeat(43))
      .expect(404);

    expect(response.body.error.code).toBe('ORDER_NOT_FOUND');
  });

  it('requires a valid receipt token to retrieve an order', async () => {
    const response = await request(app)
      .get(`/v1/orders/${order.id}`)
      .expect(400);

    expect(response.body.error.code).toBe('INVALID_REQUEST');
  });

  it('returns a structured error when a product does not exist', async () => {
    const response = await request(app).get('/v1/products/missing').expect(404);

    expect(response.body).toEqual({
      error: {
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      },
    });
  });

  it('rejects an invalid product identifier', async () => {
    const response = await request(app).get('/v1/products/%20').expect(400);

    expect(response.body.error.code).toBe('INVALID_REQUEST');
  });

  it('allows preflight requests from a configured web origin', async () => {
    const response = await request(app)
      .options('/v1/products')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET')
      .expect(204);

    expect(response.headers['access-control-allow-origin']).toBe(
      'http://localhost:3000',
    );
  });

  it('does not grant CORS access to an unconfigured origin', async () => {
    const response = await request(app)
      .get('/health')
      .set('Origin', 'https://example.com')
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('serves its OpenAPI document and Swagger UI', async () => {
    const openApiResponse = await request(app).get('/openapi.json').expect(200);
    const docsResponse = await request(app).get('/docs/').expect(200);

    expect(openApiResponse.body.openapi).toBe('3.1.0');
    expect(openApiResponse.body.paths).toHaveProperty('/v1/products');
    expect(openApiResponse.body.paths).toHaveProperty(
      '/v1/products/{productId}',
    );
    expect(openApiResponse.body.paths).toHaveProperty('/v1/orders');
    expect(openApiResponse.body.paths).toHaveProperty('/v1/orders/preview');
    expect(openApiResponse.body.paths).toHaveProperty('/v1/orders/{orderId}');
    expect(docsResponse.text).toContain(
      '<title>Bite API documentation</title>',
    );
    expect(docsResponse.text).toContain(
      'swagger-ui-dist@5.32.11/swagger-ui-bundle.js',
    );
    expect(docsResponse.text).toContain("url: '/openapi.json'");
    expect(docsResponse.headers['content-type']).toMatch(/^text\/html/);
  });
});
