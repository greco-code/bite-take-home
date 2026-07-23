import { useQuery } from '@tanstack/react-query';

import {
  productListQueryOptions,
  productQueryOptions,
} from './product-query-options';

export const useProductsQuery = () => useQuery(productListQueryOptions);

export const useProductQuery = (productId: string) =>
  useQuery(productQueryOptions(productId));
