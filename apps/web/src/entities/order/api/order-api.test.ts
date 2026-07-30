import { afterEach, describe, expect, it, vi } from 'vitest';

import { createOrder, fetchOrder, previewOrder } from './order-api';

const order = {
  id: 'fd150cbc-9737-43e7-80dd-2f6789839106',
  total: 790,
  createdAt: '2026-07-23T19:00:00.000Z',
  lines: [
    {
      position: 1,
      productId: '1',
      name: 'Maine Root-Cola',
      unitPrice: 395,
      quantity: 2,
      lineTotal: 790,
    },
  ],
};
const receiptToken = 'a'.repeat(43);

describe('order API client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('submits the reviewed cart for checkout', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4000');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ order, receiptToken }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await createOrder({
      lines: [{ productId: '1', quantity: 2 }],
      reviewToken: 'b'.repeat(64),
      acceptUnavailableExclusions: true,
    });

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:4000/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lines: [{ productId: '1', quantity: 2 }],
        reviewToken: 'b'.repeat(64),
        acceptUnavailableExclusions: true,
      }),
    });
  });

  it('requests a live order preview', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4000');
    const preview = {
      lines: [
        {
          status: 'available',
          position: 1,
          productId: '1',
          name: 'Maine Root-Cola',
          unitPrice: 395,
          quantity: 2,
          lineTotal: 790,
        },
      ],
      total: 790,
      reviewToken: 'b'.repeat(64),
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(preview), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      previewOrder({ lines: [{ productId: '1', quantity: 2 }] }),
    ).resolves.toEqual(preview);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/v1/orders/preview',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lines: [{ productId: '1', quantity: 2 }],
        }),
      },
    );
  });

  it('sends the private receipt token in a header when retrieving an order', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4000');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(order), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await fetchOrder(order.id, receiptToken);

    const requestOptions = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `http://localhost:4000/v1/orders/${order.id}`,
    );
    expect(new Headers(requestOptions.headers).get('x-order-token')).toBe(
      receiptToken,
    );
  });
});
