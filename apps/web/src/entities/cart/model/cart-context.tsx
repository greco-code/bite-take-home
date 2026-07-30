'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
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
  isHydrated: boolean;
  lines: readonly CartLine[];
  itemCount: number;
  subtotal: number;
  addProduct: (product: Product) => void;
  clearCart: () => void;
  decrementLine: (lineId: string) => void;
  incrementLine: (lineId: string) => void;
  removeLine: (lineId: string) => void;
  reconcileProducts: (products: readonly Product[]) => void;
}>;

const CartContext = createContext<CartContextValue | null>(null);

type CartProviderProps = Readonly<{
  children: ReactNode;
}>;

type CartProviderState = CartState &
  Readonly<{
    isHydrated: boolean;
  }>;

const INITIAL_CART_STATE: CartProviderState = {
  ...EMPTY_CART,
  isHydrated: false,
};

const cartProviderReducer = (
  state: CartProviderState,
  action: CartAction,
): CartProviderState => ({
  ...cartReducer(state, action),
  isHydrated: action.type === 'hydrate' ? true : state.isHydrated,
});

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartProviderReducer, INITIAL_CART_STATE);

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

  useEffect(() => {
    if (state.isHydrated) {
      persistCart(state);
    }
  }, [state]);

  const addProduct = useCallback(
    (product: Product) =>
      dispatch({
        type: 'add',
        lineId: crypto.randomUUID(),
        product,
      }),
    [],
  );
  const clearCart = useCallback(() => dispatch({ type: 'clear' }), []);
  const decrementLine = useCallback(
    (lineId: string) => dispatch({ type: 'decrement', lineId }),
    [],
  );
  const incrementLine = useCallback(
    (lineId: string) => dispatch({ type: 'increment', lineId }),
    [],
  );
  const reconcileProducts = useCallback(
    (products: readonly Product[]) =>
      dispatch({ type: 'reconcile', products }),
    [],
  );
  const removeLine = useCallback(
    (lineId: string) => dispatch({ type: 'remove', lineId }),
    [],
  );

  const value = useMemo<CartContextValue>(() => {
    return {
      isHydrated: state.isHydrated,
      lines: state.lines,
      itemCount: getCartItemCount(state),
      subtotal: getCartSubtotal(state),
      addProduct,
      clearCart,
      decrementLine,
      incrementLine,
      reconcileProducts,
      removeLine,
    };
  }, [
    addProduct,
    clearCart,
    decrementLine,
    incrementLine,
    reconcileProducts,
    removeLine,
    state,
  ]);

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
