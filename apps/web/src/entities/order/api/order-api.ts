import {
  createOrderResponseSchema,
  orderResponseSchema,
  type CreateOrderRequest,
  type CreateOrderResponse,
  type OrderResponse,
} from '@bite/contracts';

import { apiRequest } from '@/shared/api';

export const createOrder = (
  request: CreateOrderRequest,
): Promise<CreateOrderResponse> =>
  apiRequest('/v1/orders', createOrderResponseSchema, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

export const fetchOrder = (
  orderId: string,
  receiptToken: string,
  options?: RequestInit,
): Promise<OrderResponse> => {
  const headers = new Headers(options?.headers);
  headers.set('x-order-token', receiptToken);

  return apiRequest(
    `/v1/orders/${encodeURIComponent(orderId)}`,
    orderResponseSchema,
    {
      ...options,
      headers,
    },
  );
};
