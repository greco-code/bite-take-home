import { useQuery } from '@tanstack/react-query';

import { type Product } from '@bite/contracts';

import {
  productListQueryOptions,
  productQueryOptions,
} from './product-query-options';

export const useProductsQuery = (initialData: Product[] | undefined) =>
  useQuery({
    ...productListQueryOptions,
    initialData: () => initialData,
  });

export const useCartProductsQuery = (enabled: boolean) =>
  useQuery({
    ...productListQueryOptions,
    enabled,
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    refetchOnWindowFocus: 'always',
    staleTime: 0,
  });

export const useProductQuery = (
  productId: string,
  initialData: Product | undefined,
) =>
  useQuery({
    ...productQueryOptions(productId),
    initialData: () => initialData,
  });
