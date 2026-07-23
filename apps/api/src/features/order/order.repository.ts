import { and, asc, eq } from 'drizzle-orm';

import { type Order } from '@bite/contracts';

import { type Database } from '../../database/client.js';
import { orderLines, orders } from '../../database/schema.js';

export interface OrderRepository {
  createOrder(order: Order, receiptTokenHash: string): Promise<void>;
  findOrder(orderId: string, receiptTokenHash: string): Promise<Order | null>;
}

export const createOrderRepository = (database: Database): OrderRepository => ({
  async createOrder(order, receiptTokenHash) {
    await database.batch([
      database.insert(orders).values({
        id: order.id,
        receiptTokenHash,
        total: order.total,
        createdAt: order.createdAt,
      }),
      database.insert(orderLines).values(
        order.lines.map((line) => ({
          orderId: order.id,
          position: line.position,
          productId: line.productId,
          name: line.name,
          unitPrice: line.unitPrice,
          quantity: line.quantity,
        })),
      ),
    ]);
  },

  async findOrder(orderId, receiptTokenHash) {
    const rows = await database
      .select({
        id: orders.id,
        total: orders.total,
        createdAt: orders.createdAt,
        position: orderLines.position,
        productId: orderLines.productId,
        name: orderLines.name,
        unitPrice: orderLines.unitPrice,
        quantity: orderLines.quantity,
      })
      .from(orders)
      .innerJoin(orderLines, eq(orderLines.orderId, orders.id))
      .where(
        and(
          eq(orders.id, orderId),
          eq(orders.receiptTokenHash, receiptTokenHash),
        ),
      )
      .orderBy(asc(orderLines.position));

    const firstRow = rows[0];

    if (!firstRow) {
      return null;
    }

    return {
      id: firstRow.id,
      total: firstRow.total,
      createdAt: new Date(firstRow.createdAt).toISOString(),
      lines: rows.map((row) => ({
        position: row.position,
        productId: row.productId,
        name: row.name,
        unitPrice: row.unitPrice,
        quantity: row.quantity,
        lineTotal: row.unitPrice * row.quantity,
      })),
    };
  },
});
