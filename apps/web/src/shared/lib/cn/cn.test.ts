import { describe, expect, it } from 'vitest';

import { cn } from './cn';

describe('cn', () => {
  it('joins only present class names', () => {
    expect(cn('button', undefined, false, 'active', null)).toBe(
      'button active',
    );
  });
});
