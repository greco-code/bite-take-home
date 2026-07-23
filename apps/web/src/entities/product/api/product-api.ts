import {
  productListResponseSchema,
  productSchema,
  type Product,
} from '@bite/contracts';

import { apiRequest } from '@/shared/api';

export const fetchProducts = (signal?: AbortSignal): Promise<Product[]> =>
  apiRequest('/v1/products', productListResponseSchema, signal);

export const fetchProduct = (
  productId: string,
  signal?: AbortSignal,
): Promise<Product> =>
  apiRequest(
    `/v1/products/${encodeURIComponent(productId)}`,
    productSchema,
    signal,
  );
