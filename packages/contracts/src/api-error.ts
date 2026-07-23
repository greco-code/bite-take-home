import { z } from 'zod';

export const apiErrorCodeSchema = z.enum([
  'INVALID_REQUEST',
  'PRODUCT_NOT_FOUND',
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
