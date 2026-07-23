import { Router } from 'express';

import {
  apiErrorResponseSchema,
  productListResponseSchema,
  productParamsSchema,
  productSchema,
} from '@bite/contracts';

import { type CatalogRepository } from './catalog.repository.js';

export const createCatalogRouter = (
  catalogRepository: CatalogRepository,
): Router => {
  const router = Router();

  router.get('/', async (_request, response) => {
    const products = await catalogRepository.listProducts();

    response.json(productListResponseSchema.parse(products));
  });

  router.get('/:productId', async (request, response) => {
    const params = productParamsSchema.safeParse(request.params);

    if (!params.success) {
      response.status(400).json(
        apiErrorResponseSchema.parse({
          error: {
            code: 'INVALID_REQUEST',
            message: 'A valid product ID is required.',
          },
        }),
      );
      return;
    }

    const product = await catalogRepository.findProductById(
      params.data.productId,
    );

    if (!product) {
      response.status(404).json(
        apiErrorResponseSchema.parse({
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product not found.',
          },
        }),
      );
      return;
    }

    response.json(productSchema.parse(product));
  });

  return router;
};
