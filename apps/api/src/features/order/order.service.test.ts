import { describe, expect, it } from 'vitest';

import { type Product } from '@bite/contracts';

import { type CatalogRepository } from '../catalog/catalog.repository.js';

import { type OrderRepository } from './order.repository.js';
import { createOrderService } from './order.service.js';

const products: Product[] = [
  {
    id: '1',
    name: 'Maine Root-Cola',
    description: 'A fair-trade cola.',
    price: 395,
    imageUrl: 'https://example.com/cola.jpg',
    status: 'available',
  },
  {
    id: '2',
    name: 'Cookie',
    description: 'A chocolate chip cookie.',
    price: 275,
    imageUrl: 'https://example.com/cookie.jpg',
    status: 'unavailable',
  },
];

const createDependencies = () => {
  const createdOrders: Array<{
    order: Parameters<OrderRepository['createOrder']>[0];
    receiptTokenHash: string;
  }> = [];
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
  const orderRepository: OrderRepository = {
    async createOrder(order, receiptTokenHash) {
      createdOrders.push({ order, receiptTokenHash });
    },
    async findOrder() {
      return null;
    },
  };

  return {
    createdOrders,
    catalogRepository,
    orderRepository,
  };
};

describe('order service', () => {
  it('prices products on the server and preserves duplicate cart lines', async () => {
    const dependencies = createDependencies();
    const service = createOrderService(
      dependencies.catalogRepository,
      dependencies.orderRepository,
    );

    const request = {
      lines: [
        { productId: '1', quantity: 1 },
        { productId: '1', quantity: 2 },
      ],
    };
    const preview = await service.previewOrder(request);
    const result = await service.createOrder({
      ...request,
      reviewToken: preview.reviewToken,
      acceptUnavailableExclusions: true,
    });

    expect(result.status).toBe('created');

    if (result.status !== 'created') {
      throw new Error('Expected an order to be created.');
    }

    expect(result.response.order.total).toBe(1185);
    expect(result.response.order.lines).toEqual([
      {
        position: 1,
        productId: '1',
        name: 'Maine Root-Cola',
        unitPrice: 395,
        quantity: 1,
        lineTotal: 395,
      },
      {
        position: 2,
        productId: '1',
        name: 'Maine Root-Cola',
        unitPrice: 395,
        quantity: 2,
        lineTotal: 790,
      },
    ]);
    expect(dependencies.createdOrders).toHaveLength(1);
    expect(dependencies.createdOrders[0]?.receiptTokenHash).toMatch(
      /^[a-f0-9]{64}$/,
    );
    expect(dependencies.createdOrders[0]?.receiptTokenHash).not.toBe(
      result.response.receiptToken,
    );
  });

  it('previews unavailable lines and does not persist an empty order', async () => {
    const dependencies = createDependencies();
    const service = createOrderService(
      dependencies.catalogRepository,
      dependencies.orderRepository,
    );

    const request = { lines: [{ productId: '2', quantity: 1 }] };
    const preview = await service.previewOrder(request);
    const result = await service.createOrder({
      ...request,
      reviewToken: preview.reviewToken,
      acceptUnavailableExclusions: true,
    });

    expect(preview.lines).toEqual([
      { status: 'unavailable', position: 1, productId: '2' },
    ]);
    expect(preview.total).toBe(0);
    expect(result).toEqual({ status: 'no-available-products' });
    expect(dependencies.createdOrders).toHaveLength(0);
  });

  it('creates a reviewed order without unavailable lines', async () => {
    const dependencies = createDependencies();
    const service = createOrderService(
      dependencies.catalogRepository,
      dependencies.orderRepository,
    );
    const request = {
      lines: [
        { productId: 'missing', quantity: 1 },
        { productId: '1', quantity: 2 },
      ],
    };
    const preview = await service.previewOrder(request);
    const result = await service.createOrder({
      ...request,
      reviewToken: preview.reviewToken,
      acceptUnavailableExclusions: true,
    });

    expect(result.status).toBe('created');
    expect(dependencies.createdOrders[0]?.order.lines).toEqual([
      {
        position: 1,
        productId: '1',
        name: 'Maine Root-Cola',
        unitPrice: 395,
        quantity: 2,
        lineTotal: 790,
      },
    ]);
    expect(dependencies.createdOrders[0]?.order.total).toBe(790);
  });

  it('requires another review when live product data changes', async () => {
    const dependencies = createDependencies();
    const service = createOrderService(
      dependencies.catalogRepository,
      dependencies.orderRepository,
    );
    const request = { lines: [{ productId: '1', quantity: 1 }] };
    const preview = await service.previewOrder(request);

    products[0]!.price = 450;
    const result = await service.createOrder({
      ...request,
      reviewToken: preview.reviewToken,
      acceptUnavailableExclusions: true,
    });
    products[0]!.price = 395;

    expect(result).toEqual({ status: 'review-required' });
    expect(dependencies.createdOrders).toHaveLength(0);
  });
});
