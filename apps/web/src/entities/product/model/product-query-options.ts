import { queryOptions } from '@tanstack/react-query';

import { fetchProduct, fetchProducts } from '../api/product-api';

export const productQueryKeys = {
  all: ['products'] as const,
  detail: (productId: string) => ['products', productId] as const,
};

export const productListQueryOptions = queryOptions({
  queryKey: productQueryKeys.all,
  queryFn: ({ signal }) => fetchProducts({ signal }),
});

export const productQueryOptions = (productId: string) =>
  queryOptions({
    queryKey: productQueryKeys.detail(productId),
    queryFn: ({ signal }) => fetchProduct(productId, { signal }),
  });
