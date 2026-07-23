import { describe, expect, it } from 'vitest';

import { ApiError } from '@/shared/api';

import { getCheckoutErrorContent } from './get-checkout-error-content';

describe('checkout error content', () => {
  it('asks the customer to review an unavailable product', () => {
    expect(
      getCheckoutErrorContent(
        new ApiError(
          'One or more products are no longer available.',
          409,
          'PRODUCT_UNAVAILABLE',
        ),
      ),
    ).toEqual({
      title: 'Your cart needs an update.',
      message: 'One or more products are no longer available.',
    });
  });

  it('explains that an ambiguous network failure did not clear the cart', () => {
    expect(
      getCheckoutErrorContent(
        new ApiError('Failed to fetch.', 0, 'NETWORK_ERROR'),
      ),
    ).toEqual({
      title: 'We could not confirm your order.',
      message:
        'Your cart is still saved. Check your connection and wait a moment before trying again.',
    });
  });

  it('provides a safe fallback for an unexpected client error', () => {
    expect(getCheckoutErrorContent(new Error('Unexpected'))).toEqual({
      title: 'We could not complete your order.',
      message: 'Your cart is still saved. Please try again.',
    });
  });
});
