import { createHash, randomBytes, randomUUID } from 'node:crypto';

import {
  type CreateOrderRequest,
  type CreateOrderResponse,
  type Order,
  type OrderLine,
} from '@bite/contracts';

import { type CatalogRepository } from '../catalog/catalog.repository.js';

import { type OrderRepository } from './order.repository.js';

export type CreateOrderResult =
  | Readonly<{
      status: 'created';
      response: CreateOrderResponse;
    }>
  | Readonly<{
      status: 'product-unavailable';
    }>;

export interface OrderService {
  createOrder(request: CreateOrderRequest): Promise<CreateOrderResult>;
  findOrder(orderId: string, receiptToken: string): Promise<Order | null>;
}

export const createOrderService = (
  catalogRepository: CatalogRepository,
  orderRepository: OrderRepository,
): OrderService => ({
  async createOrder(request) {
    const productIds = [
      ...new Set(request.lines.map((line) => line.productId)),
    ];
    const products = await catalogRepository.findProductsByIds(productIds);
    const productsById = new Map(
      products.map((product) => [product.id, product]),
    );
    const lines: OrderLine[] = [];

    for (const [index, line] of request.lines.entries()) {
      const product = productsById.get(line.productId);

      if (!product) {
        return { status: 'product-unavailable' };
      }

      lines.push({
        position: index + 1,
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: line.quantity,
        lineTotal: product.price * line.quantity,
      });
    }

    const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const receiptToken = randomBytes(32).toString('base64url');
    const order: Order = {
      id: randomUUID(),
      total,
      createdAt: new Date().toISOString(),
      lines,
    };

    await orderRepository.createOrder(order, hashReceiptToken(receiptToken));

    return {
      status: 'created',
      response: {
        order,
        receiptToken,
      },
    };
  },

  findOrder(orderId, receiptToken) {
    return orderRepository.findOrder(orderId, hashReceiptToken(receiptToken));
  },
});

const hashReceiptToken = (receiptToken: string) =>
  createHash('sha256').update(receiptToken).digest('hex');
