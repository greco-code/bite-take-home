'use client';

import Link from 'next/link';

import { useCart } from '@/entities/cart';

import styles from './SiteHeader.module.scss';

export function SiteHeader() {
  const { isHydrated, itemCount } = useCart();
  const itemLabel = isHydrated
    ? `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`
    : 'Cart loading';

  return (
    <>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link className={styles.brand} href="/" aria-label="Bite home">
            <span className={styles.mark} aria-hidden="true">
              B
            </span>
            <span>Bite</span>
          </Link>
          <div className={styles.actions}>
            <p className={styles.tagline}>Simple food. Good mood.</p>
            <Link className={styles.cartLink} href="/cart">
              Cart
              <span
                className={styles.cartCount}
                aria-label={itemLabel}
                aria-live="polite"
                key={itemLabel}
              >
                {isHydrated ? itemCount : '…'}
              </span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
