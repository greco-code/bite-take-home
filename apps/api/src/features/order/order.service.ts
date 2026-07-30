import { createHash, randomBytes, randomUUID } from 'node:crypto';

import {
  type CreateOrderRequest,
  type CreateOrderResponse,
  type Order,
  type OrderLine,
  type OrderPreviewResponse,
  type PreviewOrderRequest,
} from '@bite/contracts';

import { type CatalogRepository } from '../catalog/catalog.repository.js';

import { type OrderRepository } from './order.repository.js';

export type CreateOrderResult =
  | Readonly<{
      status: 'created';
      response: CreateOrderResponse;
    }>
  | Readonly<{
      status: 'no-available-products';
    }>
  | Readonly<{
      status: 'review-required';
    }>;

export interface OrderService {
  createOrder(request: CreateOrderRequest): Promise<CreateOrderResult>;
  findOrder(orderId: string, receiptToken: string): Promise<Order | null>;
  previewOrder(request: PreviewOrderRequest): Promise<OrderPreviewResponse>;
}

export const createOrderService = (
  catalogRepository: CatalogRepository,
  orderRepository: OrderRepository,
): OrderService => ({
  async createOrder(request) {
    const preview = await resolveOrderPreview(catalogRepository, request);

    if (preview.reviewToken !== request.reviewToken) {
      return { status: 'review-required' };
    }

    const availableLines = preview.lines.filter(
      (line) => line.status === 'available',
    );

    if (availableLines.length === 0) {
      return { status: 'no-available-products' };
    }

    const lines: OrderLine[] = availableLines.map((line, index) => ({
      position: index + 1,
      productId: line.productId,
      name: line.name,
      unitPrice: line.unitPrice,
      quantity: line.quantity,
      lineTotal: line.lineTotal,
    }));
    const receiptToken = randomBytes(32).toString('base64url');
    const order: Order = {
      id: randomUUID(),
      total: preview.total,
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

  previewOrder(request) {
    return resolveOrderPreview(catalogRepository, request);
  },
});

const resolveOrderPreview = async (
  catalogRepository: CatalogRepository,
  request: PreviewOrderRequest,
): Promise<OrderPreviewResponse> => {
  const productIds = [
    ...new Set(request.lines.map((line) => line.productId)),
  ];
  const products = await catalogRepository.findProductsByIds(productIds);
  const productsById = new Map(
    products.map((product) => [product.id, product]),
  );
  const lines: OrderPreviewResponse['lines'] = request.lines.map(
    (line, index) => {
      const product = productsById.get(line.productId);

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
    },
  );

  const total = lines.reduce(
    (sum, line) =>
      line.status === 'available' ? sum + line.lineTotal : sum,
    0,
  );
  const reviewToken = createHash('sha256')
    .update(JSON.stringify({ lines, total }))
    .digest('hex');

  return {
    lines,
    total,
    reviewToken,
  };
};

const hashReceiptToken = (receiptToken: string) =>
  createHash('sha256').update(receiptToken).digest('hex');
