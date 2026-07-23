import { type QueryClient } from '@tanstack/react-query';

import { type OrderResponse } from '@bite/contracts';

import { orderQueryKeys } from '@/entities/order';

export const cacheCompletedOrder = (
  queryClient: QueryClient,
  order: OrderResponse,
) => {
  queryClient.setQueryData(orderQueryKeys.detail(order.id), order);
};
