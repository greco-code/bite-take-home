import { Router } from 'express';

import {
  apiErrorResponseSchema,
  createOrderRequestSchema,
  createOrderResponseSchema,
  orderParamsSchema,
  orderPreviewResponseSchema,
  orderResponseSchema,
  previewOrderRequestSchema,
  receiptTokenSchema,
} from '@bite/contracts';

import { type OrderService } from './order.service.js';

export const createOrderRouter = (orderService: OrderService): Router => {
  const router = Router();

  router.post('/preview', async (request, response) => {
    const body = previewOrderRequestSchema.safeParse(request.body);

    if (!body.success) {
      response.status(400).json(
        apiErrorResponseSchema.parse({
          error: {
            code: 'INVALID_REQUEST',
            message: 'At least one valid cart line is required.',
          },
        }),
      );
      return;
    }

    const preview = await orderService.previewOrder(body.data);

    response.json(orderPreviewResponseSchema.parse(preview));
  });

  router.post('/', async (request, response) => {
    const body = createOrderRequestSchema.safeParse(request.body);

    if (!body.success) {
      response.status(400).json(
        apiErrorResponseSchema.parse({
          error: {
            code: 'INVALID_REQUEST',
            message: 'At least one valid cart line is required.',
          },
        }),
      );

      return;
    }

    const result = await orderService.createOrder(body.data);

    if (result.status === 'review-required') {
      response.status(409).json(
        apiErrorResponseSchema.parse({
          error: {
            code: 'ORDER_REVIEW_REQUIRED',
            message:
              'Your order changed after it was reviewed. Review the latest items and total before trying again.',
          },
        }),
      );

      return;
    }

    if (result.status === 'no-available-products') {
      response.status(409).json(
        apiErrorResponseSchema.parse({
          error: {
            code: 'PRODUCT_UNAVAILABLE',
            message: 'None of the products in this cart are available.',
          },
        }),
      );
      return;
    }

    response.status(201).json(createOrderResponseSchema.parse(result.response));
  });

  router.get('/:orderId', async (request, response) => {
    const params = orderParamsSchema.safeParse(request.params);
    const receiptToken = receiptTokenSchema.safeParse(
      request.get('x-order-token'),
    );

    if (!params.success || !receiptToken.success) {
      response.status(400).json(
        apiErrorResponseSchema.parse({
          error: {
            code: 'INVALID_REQUEST',
            message: 'A valid order ID and receipt token are required.',
          },
        }),
      );

      return;
    }

    const order = await orderService.findOrder(
      params.data.orderId,
      receiptToken.data,
    );

    if (!order) {
      response.status(404).json(
        apiErrorResponseSchema.parse({
          error: {
            code: 'ORDER_NOT_FOUND',
            message: 'Order not found.',
          },
        }),
      );

      return;
    }

    response.json(orderResponseSchema.parse(order));
  });

  return router;
};
