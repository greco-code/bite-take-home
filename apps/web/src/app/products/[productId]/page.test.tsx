import { type Product } from '@bite/contracts';
import { describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api';

import ProductPage, { revalidate } from './page';

const { fetchProductMock, notFoundMock } = vi.hoisted(() => ({
  fetchProductMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('@/entities/product', () => ({
  fetchProduct: fetchProductMock,
}));

vi.mock('next/navigation', () => ({
  notFound: notFoundMock,
}));

const product: Product = {
  id: '2',
  name: 'Super Taco Salad (New!)',
  description: 'A super taco salad.',
  price: 1125,
  imageUrl: 'https://example.com/taco-salad.jpg',
};

describe('product page', () => {
  it('server-fetches and supplies the product as initial data', async () => {
    fetchProductMock.mockResolvedValue(product);

    const page = await ProductPage({
      params: Promise.resolve({ productId: product.id }),
    });

    expect(revalidate).toBe(300);
    expect(fetchProductMock).toHaveBeenCalledWith(product.id);
    expect(page.props).toMatchObject({
      initialProduct: product,
      productId: product.id,
    });
  });

  it('uses the not-found response for a confirmed missing product', async () => {
    fetchProductMock.mockRejectedValue(new ApiError('Product not found.', 404));

    await expect(
      ProductPage({
        params: Promise.resolve({ productId: 'missing' }),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFoundMock).toHaveBeenCalledOnce();
  });

  it('keeps client fetching available after a transient server failure', async () => {
    fetchProductMock.mockRejectedValue(new Error('API unavailable'));

    const page = await ProductPage({
      params: Promise.resolve({ productId: product.id }),
    });

    expect(page.props).toMatchObject({
      initialProduct: undefined,
      productId: product.id,
    });
  });
});
