import { useMutation } from '@tanstack/react-query';

import { type CreateOrderResponse } from '@bite/contracts';

import { checkoutMutationOptions } from './checkout-mutation-options';

type UseCheckoutMutationOptions = Readonly<{
  onError?: (error: Error) => void;
  onSuccess: (response: CreateOrderResponse) => void;
}>;

export const useCheckoutMutation = ({
  onError,
  onSuccess,
}: UseCheckoutMutationOptions) =>
  useMutation({
    ...checkoutMutationOptions,
    ...(onError ? { onError } : {}),
    onSuccess,
  });
