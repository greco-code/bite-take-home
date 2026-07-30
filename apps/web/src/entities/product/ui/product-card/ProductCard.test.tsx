import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { type Product } from '@bite/contracts';

import { ProductCard } from './ProductCard';

const product: Product = {
  id: '1',
  name: 'Maine Root-Cola',
  description: 'A classic cola.',
  price: 395,
  imageUrl: 'https://example.com/root-cola.jpg',
  status: 'available',
};

describe('product card', () => {
  it('preloads only when requested and includes visible text in labels', () => {
    const markup = renderToStaticMarkup(
      <ProductCard onNavigate={vi.fn()} preload product={product} />,
    );

    expect(markup).toContain('rel="preload"');
    expect(markup).toContain('aria-label="View Maine Root-Cola, $3.95"');
  });
});
