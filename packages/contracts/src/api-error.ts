import { z } from 'zod';

export const apiErrorCodeSchema = z.enum([
  'INVALID_REQUEST',
  'ORDER_REVIEW_REQUIRED',
  'ORDER_NOT_FOUND',
  'PRODUCT_NOT_FOUND',
  'PRODUCT_UNAVAILABLE',
  'INTERNAL_ERROR',
]);

export const apiErrorResponseSchema = z
  .object({
    error: z.object({
      code: apiErrorCodeSchema,
      message: z.string(),
    }),
  })
  .meta({
    id: 'ApiErrorResponse',
    description: 'A machine-readable API error.',
  });

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
