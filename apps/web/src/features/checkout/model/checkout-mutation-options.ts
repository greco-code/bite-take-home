import { mutationOptions } from '@tanstack/react-query';

import { createOrder } from '@/entities/order';

export const checkoutMutationOptions = mutationOptions({
  mutationKey: ['orders', 'create'],
  mutationFn: createOrder,
  // Creating an order is not idempotent, so failures are not replayed automatically.
  retry: false,
});
