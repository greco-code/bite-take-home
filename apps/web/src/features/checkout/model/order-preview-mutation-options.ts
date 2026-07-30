import { mutationOptions } from '@tanstack/react-query';

import { previewOrder } from '@/entities/order';

export const orderPreviewMutationOptions = mutationOptions({
  mutationFn: previewOrder,
});
