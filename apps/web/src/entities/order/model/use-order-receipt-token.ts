import { useSyncExternalStore } from 'react';

import {
  getOrderReceiptToken,
  subscribeToOrderReceiptTokens,
} from './order-receipt-storage';

export const useOrderReceiptToken = (orderId: string) =>
  useSyncExternalStore(
    subscribeToOrderReceiptTokens,
    () => getOrderReceiptToken(orderId),
    () => undefined,
  );
