import { describe, expect, it } from 'vitest';

import { formatPrice } from './format-price';

describe('formatPrice', () => {
  it('formats integer cents as US dollars', () => {
    expect(formatPrice(395)).toBe('$3.95');
    expect(formatPrice(0)).toBe('$0.00');
  });
});
