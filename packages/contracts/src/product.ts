import { z } from 'zod';

export const productIdSchema = z.string().trim().min(1).meta({
  description: 'Stable catalog product identifier.',
  example: '1',
});

export const productSchema = z
  .object({
    id: productIdSchema,
    name: z.string().trim().min(1).meta({
      description: 'Display name of the product.',
      example: 'Maine Root-Cola',
    }),
    description: z.string().trim().min(1).meta({
      description: 'Short product description.',
      example: 'A sweet, carbonated beverage.',
    }),
    price: z.number().int().nonnegative().meta({
      description: 'Product price in integer cents.',
      example: 395,
    }),
    imageUrl: z.url().meta({
      description: 'Public product image URL.',
      example:
        'https://assets.admin.getabite.co/items/olo/6217611-1563923718946.jpg',
    }),
  })
  .meta({
    id: 'Product',
    description: 'A product available for ordering.',
  });

export type Product = z.infer<typeof productSchema>;

export const productListResponseSchema = z.array(productSchema).meta({
  id: 'ProductListResponse',
  description: 'Products currently available for ordering.',
});

export type ProductListResponse = z.infer<typeof productListResponseSchema>;

export const productParamsSchema = z.object({
  productId: productIdSchema.meta({
    param: {
      description: 'Product identifier.',
    },
  }),
});

export type ProductParams = z.infer<typeof productParamsSchema>;
