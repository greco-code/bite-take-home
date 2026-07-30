import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api';

import { fetchProduct, fetchProducts } from './product-api';

const product = {
  id: '1',
  name: 'Maine Root-Cola',
  description: 'Classic pizza with fresh mozzarella and basil.',
  price: 395,
  imageUrl:
    'https://assets.admin.getabite.co/items/olo/6217611-1563923718946.jpg',
  status: 'available',
};

describe('catalog API client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('validates and returns the product list', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4000/');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([product]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchProducts()).resolves.toEqual([product]);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/v1/products',
      undefined,
    );
  });

  it('encodes product identifiers before requesting one product', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4000');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(product), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await fetchProduct('special/item');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/v1/products/special%2Fitem',
      undefined,
    );
  });

  it('forwards request options for server-side fetching', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4000');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([product]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await fetchProducts({ cache: 'no-store' });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/v1/products',
      { cache: 'no-store' },
    );
  });

  it('turns structured API failures into a typed error', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4000');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: 'PRODUCT_NOT_FOUND',
              message: 'Product not found.',
            },
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      ),
    );

    await expect(fetchProduct('missing')).rejects.toEqual(
      new ApiError('Product not found.', 404, 'PRODUCT_NOT_FOUND'),
    );
  });

  it('rejects catalog responses that do not match the shared contract', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4000');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([{ ...product, price: -1 }]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    await expect(fetchProducts()).rejects.toThrow();
  });

  it('turns connectivity failures into a customer-safe typed error', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4000');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Offline')));

    await expect(fetchProducts()).rejects.toEqual(
      new ApiError(
        'We could not reach the server. Check your connection and try again.',
        0,
        'NETWORK_ERROR',
      ),
    );
  });

  it('turns non-JSON server failures into a customer-safe typed error', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4000');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('Bad gateway', {
          status: 502,
          headers: { 'Content-Type': 'text/plain' },
        }),
      ),
    );

    await expect(fetchProducts()).rejects.toEqual(
      new ApiError(
        'The request could not be completed.',
        502,
        'INVALID_RESPONSE',
      ),
    );
  });
});
