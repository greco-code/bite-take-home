import { queryOptions } from '@tanstack/react-query';

import { fetchOrder } from '../api/order-api';

export const orderQueryKeys = {
  detail: (orderId: string) => ['orders', orderId] as const,
};

export const orderQueryOptions = (
  orderId: string,
  receiptToken: string | null,
) =>
  queryOptions({
    queryKey: orderQueryKeys.detail(orderId),
    queryFn: ({ signal }) => {
      if (receiptToken === null) {
        throw new Error('The order receipt token is unavailable.');
      }

      return fetchOrder(orderId, receiptToken, { signal });
    },
    enabled: receiptToken !== null,
    staleTime: Number.POSITIVE_INFINITY,
  });
