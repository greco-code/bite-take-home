import { queryOptions } from '@tanstack/react-query';

import { ApiError } from '@/shared/api';

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
    retry: shouldRetryOrderQuery,
    staleTime: Number.POSITIVE_INFINITY,
  });

export const shouldRetryOrderQuery = (
  failureCount: number,
  error: Error,
): boolean => {
  if (error instanceof ApiError && error.status !== 0 && error.status < 500) {
    return false;
  }

  return failureCount < 1;
};
