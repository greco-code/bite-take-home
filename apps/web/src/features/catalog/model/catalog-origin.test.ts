import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearCatalogOrigin,
  consumeCatalogOrigin,
  markCatalogOrigin,
} from './catalog-origin';

describe('catalog origin', () => {
  const values = new Map<string, string>();

  beforeEach(() => {
    values.clear();
    vi.stubGlobal('window', {
      sessionStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        removeItem: (key: string) => values.delete(key),
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('marks and consumes a catalog-originated navigation once', () => {
    markCatalogOrigin();

    expect(consumeCatalogOrigin()).toBe(true);
    expect(consumeCatalogOrigin()).toBe(false);
  });

  it('clears a stale catalog marker', () => {
    markCatalogOrigin();
    clearCatalogOrigin();

    expect(consumeCatalogOrigin()).toBe(false);
  });
});
