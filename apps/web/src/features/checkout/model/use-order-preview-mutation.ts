import { useMutation } from '@tanstack/react-query';

import { orderPreviewMutationOptions } from './order-preview-mutation-options';

export const useOrderPreviewMutation = () =>
  useMutation(orderPreviewMutationOptions);
