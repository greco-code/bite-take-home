import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CartPage } from './CartPage';

const { useCartMock } = vi.hoisted(() => ({
  useCartMock: vi.fn(),
}));

vi.mock('@/entities/cart', () => ({
  useCart: useCartMock,
}));

vi.mock('@/features/checkout', () => ({
  CheckoutButton: () => null,
}));

const emptyCart = {
  addProduct: vi.fn(),
  clearCart: vi.fn(),
  decrementLine: vi.fn(),
  incrementLine: vi.fn(),
  itemCount: 0,
  lines: [],
  removeLine: vi.fn(),
  subtotal: 0,
};

describe('cart page', () => {
  beforeEach(() => {
    useCartMock.mockReset();
  });

  it('does not show the empty state before stored cart hydration', () => {
    useCartMock.mockReturnValue({
      ...emptyCart,
      isHydrated: false,
    });

    const markup = renderToStaticMarkup(<CartPage />);

    expect(markup).toContain('Loading your cart…');
    expect(markup).not.toContain('Nothing here yet');
  });

  it('shows the empty state after an empty cart has hydrated', () => {
    useCartMock.mockReturnValue({
      ...emptyCart,
      isHydrated: true,
    });

    const markup = renderToStaticMarkup(<CartPage />);

    expect(markup).toContain('Nothing here yet');
    expect(markup).not.toContain('Loading your cart…');
  });
});
