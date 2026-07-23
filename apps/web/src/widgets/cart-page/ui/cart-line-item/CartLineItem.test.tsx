import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { type CartLine } from '@/entities/cart';

import { CartLineItem } from './CartLineItem';

const line: CartLine = {
  id: 'line-1',
  product: {
    id: '1',
    name: 'Maine Root-Cola',
    description: 'A classic cola.',
    price: 395,
    imageUrl:
      'https://assets.admin.getabite.co/items/olo/6217611-1563923718946.jpg',
  },
  quantity: 1,
};

describe('cart line item', () => {
  it('renders a grouped quantity stepper and a separate removal action', () => {
    const markup = renderToStaticMarkup(
      <CartLineItem
        decrementLine={vi.fn()}
        incrementLine={vi.fn()}
        line={line}
        removeLine={vi.fn()}
      />,
    );

    expect(markup).toContain('aria-label="Quantity for Maine Root-Cola"');
    expect(markup).toContain(
      'aria-label="Decrease quantity of Maine Root-Cola"',
    );
    expect(markup).toContain(
      'aria-label="Increase quantity of Maine Root-Cola"',
    );
    expect(markup).toContain('aria-label="Quantity: 1"');
    expect(markup).toContain('Remove item');
    expect(markup).not.toContain('Remove one');
    expect(markup).not.toContain('Add one');
  });
});
