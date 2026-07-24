import { describe, expect, it } from 'vitest';

import { ApiError } from '@/shared/api';

import { shouldRetryOrderQuery } from './order-query-options';

describe('order query retry policy', () => {
  it('does not retry permanent receipt failures', () => {
    expect(
      shouldRetryOrderQuery(
        0,
        new ApiError('Order not found.', 404, 'ORDER_NOT_FOUND'),
      ),
    ).toBe(false);
    expect(
      shouldRetryOrderQuery(
        0,
        new ApiError('Invalid receipt.', 400, 'INVALID_REQUEST'),
      ),
    ).toBe(false);
  });

  it('retries a transient failure once', () => {
    const networkError = new ApiError(
      'Could not reach the server.',
      0,
      'NETWORK_ERROR',
    );

    expect(shouldRetryOrderQuery(0, networkError)).toBe(true);
    expect(shouldRetryOrderQuery(1, networkError)).toBe(false);
    expect(
      shouldRetryOrderQuery(
        0,
        new ApiError('Server unavailable.', 503, 'INTERNAL_ERROR'),
      ),
    ).toBe(true);
  });
});
