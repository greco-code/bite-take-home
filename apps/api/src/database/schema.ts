import { sql } from 'drizzle-orm';
import {
  check,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const productStatus = pgEnum('product_status', [
  'available',
  'unavailable',
]);

export const products = pgTable(
  'products',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    price: integer('price_cents').notNull(),
    imageUrl: text('image_url').notNull(),
    displayOrder: integer('display_order').notNull(),
    status: productStatus('status').default('available').notNull(),
  },
  (table) => [
    check('products_price_cents_nonnegative', sql`${table.price} >= 0`),
    check('products_display_order_positive', sql`${table.displayOrder} > 0`),
  ],
);

export const orders = pgTable(
  'orders',
  {
    id: text('id').primaryKey(),
    receiptTokenHash: text('receipt_token_hash').notNull().unique(),
    total: integer('total_cents').notNull(),
    createdAt: timestamp('created_at', {
      mode: 'string',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check('orders_total_cents_nonnegative', sql`${table.total} >= 0`),
  ],
);

export const orderLines = pgTable(
  'order_lines',
  {
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'restrict' }),
    name: text('product_name').notNull(),
    unitPrice: integer('unit_price_cents').notNull(),
    quantity: integer('quantity').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.orderId, table.position] }),
    check('order_lines_position_positive', sql`${table.position} > 0`),
    check(
      'order_lines_unit_price_cents_nonnegative',
      sql`${table.unitPrice} >= 0`,
    ),
    check('order_lines_quantity_positive', sql`${table.quantity} > 0`),
    check('order_lines_quantity_maximum', sql`${table.quantity} <= 99`),
  ],
);
