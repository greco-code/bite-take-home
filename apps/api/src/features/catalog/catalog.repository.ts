import { eq } from 'drizzle-orm';

import { type Product } from '@bite/contracts';

import { type Database } from '../../database/client.js';
import { products } from '../../database/schema.js';

export interface CatalogRepository {
  findProductById(productId: string): Promise<Product | null>;
  listProducts(): Promise<Product[]>;
}

export const createCatalogRepository = (
  database: Database,
): CatalogRepository => ({
  async findProductById(productId) {
    const [product] = await database
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    return product ?? null;
  },

  async listProducts() {
    return database
      .select()
      .from(products)
      .orderBy(products.displayOrder, products.id);
  },
});
