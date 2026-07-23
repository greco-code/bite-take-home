import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getOrderReceiptToken,
  saveOrderReceiptToken,
} from './order-receipt-storage';

describe('order receipt storage', () => {
  const values = new Map<string, string>();

  beforeEach(() => {
    values.clear();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('stores receipt tokens separately for each order', () => {
    saveOrderReceiptToken('order-1', 'token-1');
    saveOrderReceiptToken('order-2', 'token-2');

    expect(getOrderReceiptToken('order-1')).toBe('token-1');
    expect(getOrderReceiptToken('order-2')).toBe('token-2');
    expect(getOrderReceiptToken('order-3')).toBeNull();
  });
});
