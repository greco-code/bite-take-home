const ORDER_RECEIPT_STORAGE_PREFIX = 'bite.order-receipt.v1';
const volatileReceiptTokens = new Map<string, string>();
const listeners = new Set<() => void>();

const getStorageKey = (orderId: string) =>
  `${ORDER_RECEIPT_STORAGE_PREFIX}.${orderId}`;

export function saveOrderReceiptToken(orderId: string, receiptToken: string) {
  volatileReceiptTokens.set(orderId, receiptToken);

  try {
    window.localStorage.setItem(getStorageKey(orderId), receiptToken);
  } catch {
    // In-memory fallback keeps client-side navigation working for this session.
  }

  listeners.forEach((listener) => listener());
}

export function getOrderReceiptToken(orderId: string) {
  try {
    return (
      window.localStorage.getItem(getStorageKey(orderId)) ??
      volatileReceiptTokens.get(orderId) ??
      null
    );
  } catch {
    return volatileReceiptTokens.get(orderId) ?? null;
  }
}

export function subscribeToOrderReceiptTokens(listener: () => void) {
  listeners.add(listener);

  return () => listeners.delete(listener);
}
