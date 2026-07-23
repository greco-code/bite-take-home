import { productSchema, type Product } from '@bite/contracts';

export const CART_STORAGE_KEY = 'bite.cart.v1';

const CART_STORAGE_VERSION = 1;
const MAX_CART_LINES = 100;
const MAX_LINE_QUANTITY = 99;

export type CartLine = Readonly<{
  id: string;
  product: Product;
  quantity: number;
}>;

export type CartState = Readonly<{
  lines: readonly CartLine[];
}>;

export type CartAction =
  | Readonly<{ type: 'add'; lineId: string; product: Product }>
  | Readonly<{ type: 'decrement'; lineId: string }>
  | Readonly<{ type: 'hydrate'; state: CartState }>
  | Readonly<{ type: 'increment'; lineId: string }>
  | Readonly<{ type: 'remove'; lineId: string }>;

export const EMPTY_CART: CartState = Object.freeze({
  lines: Object.freeze([]),
});

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'hydrate':
      return action.state;

    case 'add':
      if (state.lines.length >= MAX_CART_LINES) {
        return state;
      }

      return {
        lines: [
          ...state.lines,
          {
            id: action.lineId,
            product: action.product,
            quantity: 1,
          },
        ],
      };

    case 'decrement':
      return {
        lines: state.lines.map((line) =>
          line.id === action.lineId && line.quantity > 1
            ? { ...line, quantity: line.quantity - 1 }
            : line,
        ),
      };

    case 'increment':
      return {
        lines: state.lines.map((line) =>
          line.id === action.lineId && line.quantity < MAX_LINE_QUANTITY
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        ),
      };

    case 'remove':
      return {
        lines: state.lines.filter((line) => line.id !== action.lineId),
      };
  }
}

export function getCartItemCount(state: CartState) {
  return state.lines.reduce((total, line) => total + line.quantity, 0);
}

export function getCartSubtotal(state: CartState) {
  return state.lines.reduce(
    (total, line) => total + line.product.price * line.quantity,
    0,
  );
}

export function parseStoredCart(value: string | null): CartState {
  if (value === null) {
    return EMPTY_CART;
  }

  try {
    const candidate: unknown = JSON.parse(value);

    if (
      !isRecord(candidate) ||
      candidate.version !== CART_STORAGE_VERSION ||
      !Array.isArray(candidate.lines)
    ) {
      return EMPTY_CART;
    }

    const lineIds = new Set<string>();
    const lines = candidate.lines
      .slice(0, MAX_CART_LINES)
      .map(parseCartLine)
      .filter((line): line is CartLine => {
        if (line === null || lineIds.has(line.id)) {
          return false;
        }

        lineIds.add(line.id);
        return true;
      });

    return lines.length === 0 ? EMPTY_CART : { lines };
  } catch {
    return EMPTY_CART;
  }
}

export function serializeCart(state: CartState) {
  return JSON.stringify({
    version: CART_STORAGE_VERSION,
    lines: state.lines,
  });
}

function parseCartLine(value: unknown): CartLine | null {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    value.id.trim().length === 0 ||
    !Number.isInteger(value.quantity) ||
    Number(value.quantity) < 1 ||
    Number(value.quantity) > MAX_LINE_QUANTITY
  ) {
    return null;
  }

  const product = productSchema.safeParse(value.product);

  if (!product.success) {
    return null;
  }

  return {
    id: value.id,
    product: product.data,
    quantity: Number(value.quantity),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
