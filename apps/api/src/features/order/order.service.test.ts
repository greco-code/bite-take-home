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

    const result = await service.createOrder({
      lines: [
        { productId: '1', quantity: 1 },
        { productId: '1', quantity: 2 },
      ],
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

  it('does not persist an order when a product is unavailable', async () => {
    const dependencies = createDependencies();
    const service = createOrderService(
      dependencies.catalogRepository,
      dependencies.orderRepository,
    );

    const result = await service.createOrder({
      lines: [{ productId: 'missing', quantity: 1 }],
    });

    expect(result).toEqual({ status: 'product-unavailable' });
    expect(dependencies.createdOrders).toHaveLength(0);
  });
});
