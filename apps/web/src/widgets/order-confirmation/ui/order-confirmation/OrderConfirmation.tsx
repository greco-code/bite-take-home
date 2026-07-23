'use client';

import Link from 'next/link';

import { useOrderQuery, useOrderReceiptToken } from '@/entities/order';
import { formatPrice } from '@/shared/lib/format-price';
import { StatusPanel } from '@/shared/ui/status-panel';

import styles from './OrderConfirmation.module.scss';

type OrderConfirmationProps = Readonly<{
  orderId: string;
}>;

export function OrderConfirmation({ orderId }: OrderConfirmationProps) {
  const receiptToken = useOrderReceiptToken(orderId);

  const {
    data: order,
    error,
    isPending,
    refetch,
  } = useOrderQuery(orderId, receiptToken ?? null);

  if (receiptToken === undefined || (receiptToken !== null && isPending)) {
    return (
      <main className={styles.main} id="main-content">
        <StatusPanel
          description="We are retrieving the completed order from the server."
          eyebrow="Just a moment"
          title="Loading your receipt…"
        />
      </main>
    );
  }

  if (receiptToken === null) {
    return (
      <main className={styles.main} id="main-content">
        <StatusPanel
          description="This browser does not have the private receipt token for this order."
          eyebrow="Receipt unavailable"
          title="We cannot open this order."
        />
        <Link className={styles.menuLink} href="/">
          Return to the menu
        </Link>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className={styles.main} id="main-content">
        <StatusPanel
          description={
            error?.message ??
            'The completed order could not be loaded. Please try again.'
          }
          eyebrow="Receipt unavailable"
          onRetry={() => void refetch()}
          title="We could not load your order."
        />
      </main>
    );
  }

  return (
    <main className={styles.main} id="main-content">
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Order confirmed</p>
        <h1>Thanks. It’s in the kitchen.</h1>
        <p className={styles.lede}>
          Your order was completed on{' '}
          <time dateTime={order.createdAt}>
            {new Intl.DateTimeFormat('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(new Date(order.createdAt))}
          </time>
          .
        </p>
        <p className={styles.reference}>
          Order reference <strong>{order.id}</strong>
        </p>
      </section>

      <section className={styles.receipt} aria-labelledby="receipt-title">
        <div className={styles.receiptHeading}>
          <div>
            <p className={styles.receiptEyebrow}>Receipt</p>
            <h2 id="receipt-title">Your order</h2>
          </div>
          <strong className={styles.total}>{formatPrice(order.total)}</strong>
        </div>

        <ul className={styles.lines}>
          {order.lines.map((line) => (
            <li className={styles.line} key={line.position}>
              <div>
                <strong>{line.name}</strong>
                <span>
                  {line.quantity} × {formatPrice(line.unitPrice)}
                </span>
              </div>
              <strong>{formatPrice(line.lineTotal)}</strong>
            </li>
          ))}
        </ul>

        <div className={styles.totalRow}>
          <span>Total</span>
          <strong>{formatPrice(order.total)}</strong>
        </div>
      </section>

      <Link className={styles.menuLink} href="/">
        Back to the menu
      </Link>
    </main>
  );
}
