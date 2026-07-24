import { useMutation } from '@tanstack/react-query';

import { type CreateOrderResponse } from '@bite/contracts';

import { checkoutMutationOptions } from './checkout-mutation-options';

type UseCheckoutMutationOptions = Readonly<{
  onSuccess: (response: CreateOrderResponse) => void;
}>;

export const useCheckoutMutation = ({
  onSuccess,
}: UseCheckoutMutationOptions) =>
  useMutation({
    ...checkoutMutationOptions,
    onSuccess,
  });
