import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { type Product } from '@bite/contracts';

import { createApp } from './app.js';
import { type CatalogRepository } from './features/catalog/catalog.repository.js';

const products: Product[] = [
  {
    id: '1',
    name: 'Maine Root-Cola',
    description: 'Classic pizza with fresh mozzarella and basil.',
    price: 395,
    imageUrl:
      'https://assets.admin.getabite.co/items/olo/6217611-1563923718946.jpg',
  },
  {
    id: '2',
    name: 'Super Taco Salad (New!)',
    description:
      'A super taco salad with black beans, corn, avocado, salsa, and tortilla strips.',
    price: 1125,
    imageUrl:
      'https://assets.admin.getabite.co/items/olo/7420856-1563923722357.jpg',
  },
];

const catalogRepository: CatalogRepository = {
  async findProductById(productId) {
    return products.find((product) => product.id === productId) ?? null;
  },
  async listProducts() {
    return products;
  },
};

const app = createApp({
  catalogRepository,
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
    expect(docsResponse.text).toContain(
      '<title>Bite API documentation</title>',
    );
  });
});
