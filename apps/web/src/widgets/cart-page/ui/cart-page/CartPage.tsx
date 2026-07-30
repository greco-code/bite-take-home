'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { type CartLine, useCart } from '@/entities/cart';
import { useCartProductsQuery } from '@/entities/product';
import { CheckoutButton } from '@/features/checkout';
import { Button } from '@/shared/ui/button';
import { formatPrice } from '@/shared/lib/format-price';

import { CartLineItem } from '../cart-line-item';

import styles from './CartPage.module.scss';

type CartSnapshot = Readonly<{
  itemCount: number;
  lines: readonly CartLine[];
  subtotal: number;
}>;

export function CartPage() {
  const [isCheckoutPending, setIsCheckoutPending] = useState(false);
  const [cartSnapshot, setCartSnapshot] = useState<CartSnapshot>({
    itemCount: 0,
    lines: [],
    subtotal: 0,
  });
  const {
    decrementLine,
    incrementLine,
    isHydrated,
    itemCount,
    lines,
    reconcileProducts,
    removeLine,
    subtotal,
  } = useCart();
  const catalogQuery = useCartProductsQuery(isHydrated && lines.length > 0);

  useEffect(() => {
    if (catalogQuery.data) {
      reconcileProducts(catalogQuery.data);
    }
  }, [catalogQuery.data, reconcileProducts]);
  const shouldShowSubmittedCart = isCheckoutPending && lines.length === 0;
  const visibleCart = shouldShowSubmittedCart
    ? cartSnapshot
    : { itemCount, lines, subtotal };
  const captureSubmittedCart = () => {
    setCartSnapshot({
      itemCount,
      lines,
      subtotal,
    });
  };

  return (
    <main className={styles.main} id="main-content">
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Your order</p>
          <h1 className={styles.title}>Cart</h1>
        </div>
        {isHydrated && visibleCart.lines.length > 0 ? (
          <p className={styles.count}>
            {visibleCart.itemCount}{' '}
            {visibleCart.itemCount === 1 ? 'item' : 'items'} across{' '}
            {visibleCart.lines.length}{' '}
            {visibleCart.lines.length === 1 ? 'line' : 'lines'}
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
      ) : visibleCart.lines.length === 0 ? (
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
          <section
            aria-busy={isCheckoutPending}
            className={styles.lines}
            aria-label="Cart items"
          >
            {visibleCart.lines.map((line) => (
              <CartLineItem
                decrementLine={decrementLine}
                incrementLine={incrementLine}
                isLocked={isCheckoutPending}
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
              <strong>{formatPrice(visibleCart.subtotal)}</strong>
            </div>
            <p className={styles.summaryNote}>
              Final prices are confirmed against the live menu when you complete
              the order.
            </p>
            {catalogQuery.isFetching ? (
              <p className={styles.availabilityStatus} role="status">
                Refreshing item availability…
              </p>
            ) : null}
            {catalogQuery.isError ? (
              <div className={styles.availabilityError} role="alert">
                <p>
                  We couldn’t refresh the cart. You can retry now or review the
                  order to check again.
                </p>
                <Button
                  onClick={() => void catalogQuery.refetch()}
                  size="compact"
                  variant="secondary"
                >
                  Retry refresh
                </Button>
              </div>
            ) : null}
            {isCheckoutPending ? (
              <p
                className={styles.pendingNote}
                id="cart-checkout-status"
                role="status"
              >
                Cart changes are paused while we complete your order.
              </p>
            ) : null}
            <CheckoutButton
              onCheckoutStart={captureSubmittedCart}
              onPendingChange={setIsCheckoutPending}
            />
          </aside>
        </div>
      )}
    </main>
  );
}
