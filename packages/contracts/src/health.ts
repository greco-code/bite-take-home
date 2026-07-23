import { z } from 'zod';

export const healthResponseSchema = z
  .object({
    status: z.literal('ok'),
  })
  .meta({
    id: 'HealthResponse',
    description: 'Current API health.',
  });

export type HealthResponse = z.infer<typeof healthResponseSchema>;
