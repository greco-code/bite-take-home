'use client';

import Link from 'next/link';

import { useCart } from '@/entities/cart';
import { CheckoutButton } from '@/features/checkout';
import { formatPrice } from '@/shared/lib/format-price';

import { CartLineItem } from '../cart-line-item';

import styles from './CartPage.module.scss';

export function CartPage() {
  const {
    decrementLine,
    incrementLine,
    isHydrated,
    itemCount,
    lines,
    removeLine,
    subtotal,
  } = useCart();

  return (
    <main className={styles.main} id="main-content">
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Your order</p>
          <h1 className={styles.title}>Cart</h1>
        </div>
        {isHydrated && lines.length > 0 ? (
          <p className={styles.count}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'} across{' '}
            {lines.length} {lines.length === 1 ? 'line' : 'lines'}
          </p>
        ) : null}
      </div>

      {!isHydrated ? (
        <section
          className={styles.loading}
          aria-busy="true"
          aria-label="Loading cart"
        >
          <div className={styles.loadingLineWide} />
          <div className={styles.loadingLine} />
          <span role="status">Loading your cart…</span>
        </section>
      ) : lines.length === 0 ? (
        <section className={styles.empty}>
          <p className={styles.emptyEyebrow}>Nothing here yet</p>
          <h2>Your next favorite is waiting.</h2>
          <p>
            Browse the menu and add anything that looks good. Your cart will
            still be here when you come back.
          </p>
          <Link className={styles.menuLink} href="/">
            Browse the menu
          </Link>
        </section>
      ) : (
        <div className={styles.layout}>
          <section className={styles.lines} aria-label="Cart items">
            {lines.map((line) => (
              <CartLineItem
                decrementLine={decrementLine}
                incrementLine={incrementLine}
                key={line.id}
                line={line}
                removeLine={removeLine}
              />
            ))}
          </section>

          <aside className={styles.summary} aria-labelledby="cart-summary">
            <p className={styles.summaryEyebrow}>Order summary</p>
            <h2 id="cart-summary">Ready when you are.</h2>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <p className={styles.summaryNote}>
              Final prices are confirmed against the live menu when you complete
              the order.
            </p>
            <CheckoutButton />
          </aside>
        </div>
      )}
    </main>
  );
}
