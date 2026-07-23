import { z } from 'zod';

import { productIdSchema } from './product.js';

const quantitySchema = z.number().int().min(1).max(99).meta({
  description: 'Quantity requested for this distinct cart line.',
  example: 2,
});

export const createOrderRequestSchema = z
  .object({
    lines: z
      .array(
        z.object({
          productId: productIdSchema,
          quantity: quantitySchema,
        }),
      )
      .min(1)
      .max(100),
  })
  .meta({
    id: 'CreateOrderRequest',
    description:
      'Distinct cart lines to price and persist as a completed order.',
  });

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;

export const orderIdSchema = z.uuid().meta({
  description: 'Server-generated order identifier.',
  example: 'fd150cbc-9737-43e7-80dd-2f6789839106',
});

export const orderLineSchema = z
  .object({
    position: z.number().int().positive(),
    productId: productIdSchema,
    name: z.string().trim().min(1),
    unitPrice: z.number().int().nonnegative().meta({
      description: 'Authoritative unit price at checkout, in integer cents.',
      example: 395,
    }),
    quantity: quantitySchema,
    lineTotal: z.number().int().nonnegative().meta({
      description: 'Line total in integer cents.',
      example: 790,
    }),
  })
  .meta({
    id: 'OrderLine',
    description: 'An immutable product and price snapshot for an order line.',
  });

export type OrderLine = z.infer<typeof orderLineSchema>;

export const orderSchema = z
  .object({
    id: orderIdSchema,
    total: z.number().int().nonnegative().meta({
      description: 'Authoritative order total in integer cents.',
      example: 790,
    }),
    createdAt: z.iso.datetime().meta({
      description: 'When the order was completed.',
      example: '2026-07-23T19:00:00.000Z',
    }),
    lines: z.array(orderLineSchema).min(1),
  })
  .meta({
    id: 'Order',
    description: 'A completed, server-priced order.',
  });

export type Order = z.infer<typeof orderSchema>;

export const receiptTokenSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{43}$/)
  .meta({
    description:
      'Opaque capability token required to retrieve an anonymous order.',
    example: '4dVg2F9Vea54fiXS3LzjCh1JDFqc7df24uHYrTn3q9I',
  });

export const createOrderResponseSchema = z
  .object({
    order: orderSchema,
    receiptToken: receiptTokenSchema,
  })
  .meta({
    id: 'CreateOrderResponse',
    description:
      'Completed order and the one-time-issued token used to retrieve it.',
  });

export type CreateOrderResponse = z.infer<typeof createOrderResponseSchema>;

export const orderResponseSchema = orderSchema.meta({
  id: 'OrderResponse',
});

export type OrderResponse = z.infer<typeof orderResponseSchema>;

export const orderParamsSchema = z.object({
  orderId: orderIdSchema.meta({
    param: {
      description: 'Order identifier.',
    },
  }),
});

export const orderAccessHeadersSchema = z.object({
  'x-order-token': receiptTokenSchema.meta({
    param: {
      description: 'Anonymous order receipt token.',
    },
  }),
});
