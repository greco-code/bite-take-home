import { createRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { type CartLine } from '@/entities/cart';

import { OrderReviewDialog } from './OrderReviewDialog';

const cartLines: CartLine[] = [
  {
    id: 'line-1',
    product: {
      id: '1',
      name: 'Maine Root-Cola',
      description: 'A classic cola.',
      price: 395,
      imageUrl: 'https://example.com/cola.jpg',
      status: 'available',
    },
    quantity: 2,
  },
  {
    id: 'line-2',
    product: {
      id: '2',
      name: 'Cookie',
      description: 'A chocolate chip cookie.',
      price: 275,
      imageUrl: 'https://example.com/cookie.jpg',
      status: 'unavailable',
    },
    quantity: 1,
  },
];

const renderDialog = (
  preview: Parameters<typeof OrderReviewDialog>[0]['preview'],
) =>
  renderToStaticMarkup(
    <OrderReviewDialog
      cartLines={cartLines}
      checkoutError={null}
      isCheckoutPending={false}
      isOpen
      isPreviewPending={false}
      notice={null}
      onBack={vi.fn()}
      onConfirm={vi.fn()}
      onRetryPreview={vi.fn()}
      preview={preview}
      previewError={null}
      returnFocusRef={createRef<HTMLButtonElement>()}
    />,
  );

describe('order review dialog', () => {
  it('shows live prices, total, and unavailable exclusions', () => {
    const markup = renderDialog({
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
        { status: 'unavailable', position: 2, productId: '2' },
      ],
      total: 790,
      reviewToken: 'b'.repeat(64),
    });

    expect(markup).toContain('2 × $3.95');
    expect(markup).toContain('$7.90');
    expect(markup).toContain('Cookie');
    expect(markup).toContain('Complete without unavailable items');
  });

  it('allows an all-available order to be completed normally', () => {
    const markup = renderDialog({
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
    });

    expect(markup).toContain('Complete order');
    expect(markup).not.toContain('Complete without unavailable items');
  });

  it('disables confirmation when every line is unavailable', () => {
    const markup = renderDialog({
      lines: [
        { status: 'unavailable', position: 1, productId: '1' },
        { status: 'unavailable', position: 2, productId: '2' },
      ],
      total: 0,
      reviewToken: 'b'.repeat(64),
    });

    expect(markup).toContain('Nothing in this cart is available right now.');
    expect(markup).toMatch(
      /<button[^>]*disabled=""[^>]*>Complete without unavailable items/,
    );
  });
});
