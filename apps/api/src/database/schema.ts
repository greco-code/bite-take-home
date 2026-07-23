import { sql } from 'drizzle-orm';
import { check, integer, pgTable, text } from 'drizzle-orm/pg-core';

export const products = pgTable(
  'products',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    price: integer('price_cents').notNull(),
    imageUrl: text('image_url').notNull(),
  },
  (table) => [
    check('products_price_cents_nonnegative', sql`${table.price} >= 0`),
  ],
);
