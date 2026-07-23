import { describe, expect, it } from 'vitest';

import { type Product } from '@bite/contracts';

import {
  EMPTY_CART,
  cartReducer,
  getCartItemCount,
  getCartSubtotal,
  parseStoredCart,
  serializeCart,
} from './cart';

const product: Product = {
  id: '1',
  name: 'Maine Root-Cola',
  description: 'A classic cola.',
  price: 395,
  imageUrl: 'https://example.com/cola.jpg',
};

describe('cart model', () => {
  it('creates a distinct line each time the same product is added', () => {
    const firstState = cartReducer(EMPTY_CART, {
      type: 'add',
      lineId: 'line-1',
      product,
    });
    const secondState = cartReducer(firstState, {
      type: 'add',
      lineId: 'line-2',
      product,
    });

    expect(secondState.lines).toEqual([
      { id: 'line-1', product, quantity: 1 },
      { id: 'line-2', product, quantity: 1 },
    ]);
  });

  it('changes quantity and removes only the selected line', () => {
    const initialState = {
      lines: [
        { id: 'line-1', product, quantity: 1 },
        { id: 'line-2', product, quantity: 1 },
      ],
    };
    const incrementedState = cartReducer(initialState, {
      type: 'increment',
      lineId: 'line-2',
    });
    const decrementedState = cartReducer(incrementedState, {
      type: 'decrement',
      lineId: 'line-2',
    });
    const finalState = cartReducer(decrementedState, {
      type: 'remove',
      lineId: 'line-1',
    });

    expect(finalState.lines).toEqual([{ id: 'line-2', product, quantity: 1 }]);
    expect(getCartItemCount(finalState)).toBe(1);
    expect(getCartSubtotal(finalState)).toBe(395);
  });

  it('does not decrement a line below one', () => {
    const state = {
      lines: [{ id: 'line-1', product, quantity: 1 }],
    };

    expect(cartReducer(state, { type: 'decrement', lineId: 'line-1' })).toEqual(
      state,
    );
  });

  it('clears every cart line after checkout', () => {
    const state = {
      lines: [{ id: 'line-1', product, quantity: 2 }],
    };

    expect(cartReducer(state, { type: 'clear' })).toBe(EMPTY_CART);
  });

  it('round-trips valid versioned storage', () => {
    const state = {
      lines: [{ id: 'line-1', product, quantity: 2 }],
    };

    expect(parseStoredCart(serializeCart(state))).toEqual(state);
  });

  it('ignores invalid stored data and keeps valid lines', () => {
    const storedValue = JSON.stringify({
      version: 1,
      lines: [
        { id: 'line-1', product, quantity: 2 },
        { id: 'line-1', product, quantity: 3 },
        { id: '', product, quantity: 1 },
        { id: 'line-3', product, quantity: -1 },
      ],
    });

    expect(parseStoredCart(storedValue)).toEqual({
      lines: [{ id: 'line-1', product, quantity: 2 }],
    });
    expect(parseStoredCart('{not-json')).toBe(EMPTY_CART);
    expect(parseStoredCart(JSON.stringify({ version: 999, lines: [] }))).toBe(
      EMPTY_CART,
    );
  });
});
