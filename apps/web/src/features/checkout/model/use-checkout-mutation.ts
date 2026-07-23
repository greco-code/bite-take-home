import { useMutation } from '@tanstack/react-query';

import { checkoutMutationOptions } from './checkout-mutation-options';

export const useCheckoutMutation = () => useMutation(checkoutMutationOptions);
