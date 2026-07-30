import { type Product } from '@bite/contracts';
import { describe, expect, it, vi } from 'vitest';

import HomePage, { revalidate } from './page';

const { fetchProductsMock } = vi.hoisted(() => ({
  fetchProductsMock: vi.fn(),
}));

vi.mock('@/entities/product', () => ({
  fetchProducts: fetchProductsMock,
}));

const products: Product[] = [
  {
    id: '1',
    name: 'Maine Root-Cola',
    description: 'A classic cola.',
    price: 395,
    imageUrl: 'https://example.com/root-cola.jpg',
    status: 'available',
  },
];

describe('home page', () => {
  it('revalidates the shared catalog and supplies server data', async () => {
    fetchProductsMock.mockResolvedValue(products);

    const page = await HomePage();

    expect(revalidate).toBe(300);
    expect(fetchProductsMock).toHaveBeenCalledWith();
    expect(page.props.initialProducts).toEqual(products);
  });
});
