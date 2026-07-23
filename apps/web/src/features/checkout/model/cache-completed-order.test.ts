import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { type OrderResponse } from '@bite/contracts';

import { orderQueryKeys } from '@/entities/order';

import { cacheCompletedOrder } from './cache-completed-order';

const order: OrderResponse = {
  id: 'a4ec82e5-c6f8-4e22-bf4c-d9cad7d51081',
  total: 790,
  createdAt: '2026-07-23T12:00:00.000Z',
  lines: [
    {
      position: 0,
      productId: '1',
      name: 'Maine Root-Cola',
      unitPrice: 395,
      quantity: 2,
      lineTotal: 790,
    },
  ],
};

describe('completed order cache', () => {
  it('makes the checkout response available to the receipt query', () => {
    const queryClient = new QueryClient();

    cacheCompletedOrder(queryClient, order);

    expect(queryClient.getQueryData(orderQueryKeys.detail(order.id))).toEqual(
      order,
    );
  });
});
