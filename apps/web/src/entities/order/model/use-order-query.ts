import { useQuery } from '@tanstack/react-query';

import { orderQueryOptions } from './order-query-options';

export const useOrderQuery = (orderId: string, receiptToken: string | null) =>
  useQuery(orderQueryOptions(orderId, receiptToken));
