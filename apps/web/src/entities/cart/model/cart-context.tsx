'use client';

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

import { type Product } from '@bite/contracts';

import {
  CART_STORAGE_KEY,
  EMPTY_CART,
  cartReducer,
  getCartItemCount,
  getCartSubtotal,
  parseStoredCart,
  serializeCart,
  type CartAction,
  type CartLine,
  type CartState,
} from './cart';

type CartContextValue = Readonly<{
  lines: readonly CartLine[];
  itemCount: number;
  subtotal: number;
  addProduct: (product: Product) => void;
  decrementLine: (lineId: string) => void;
  incrementLine: (lineId: string) => void;
  removeLine: (lineId: string) => void;
}>;

const CartContext = createContext<CartContextValue | null>(null);

type CartProviderProps = Readonly<{
  children: ReactNode;
}>;

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, EMPTY_CART);

  useEffect(() => {
    let storedCart = EMPTY_CART;

    try {
      storedCart = parseStoredCart(
        window.localStorage.getItem(CART_STORAGE_KEY),
      );
    } catch {
      // The cart remains available in memory when storage cannot be read.
    }

    dispatch({ type: 'hydrate', state: storedCart });
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const update = (action: CartAction) => {
      const nextState = cartReducer(state, action);
      persistCart(nextState);
      dispatch(action);
    };

    return {
      lines: state.lines,
      itemCount: getCartItemCount(state),
      subtotal: getCartSubtotal(state),
      addProduct: (product) =>
        update({
          type: 'add',
          lineId: crypto.randomUUID(),
          product,
        }),
      decrementLine: (lineId) => update({ type: 'decrement', lineId }),
      incrementLine: (lineId) => update({ type: 'increment', lineId }),
      removeLine: (lineId) => update({ type: 'remove', lineId }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);

  if (cart === null) {
    throw new Error('useCart must be used within CartProvider.');
  }

  return cart;
}

function persistCart(state: CartState) {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, serializeCart(state));
  } catch {
    // The cart remains available in memory when storage cannot be written.
  }
}
