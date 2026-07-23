import {
  productListResponseSchema,
  productSchema,
  type Product,
} from '@bite/contracts';

import { apiRequest } from '@/shared/api';

export const fetchProducts = (options?: RequestInit): Promise<Product[]> =>
  apiRequest('/v1/products', productListResponseSchema, options);

export const fetchProduct = (
  productId: string,
  options?: RequestInit,
): Promise<Product> =>
  apiRequest(
    `/v1/products/${encodeURIComponent(productId)}`,
    productSchema,
    options,
  );
