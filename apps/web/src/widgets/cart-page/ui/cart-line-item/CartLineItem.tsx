'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { type CartLine } from '@/entities/cart';
import { formatPrice } from '@/shared/lib/format-price';
import { Button } from '@/shared/ui/button';

import styles from './CartLineItem.module.scss';

type CartLineItemProps = Readonly<{
  decrementLine: (lineId: string) => void;
  incrementLine: (lineId: string) => void;
  line: CartLine;
  removeLine: (lineId: string) => void;
}>;

export function CartLineItem({
  decrementLine,
  incrementLine,
  line,
  removeLine,
}: CartLineItemProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const lineTotal = line.product.price * line.quantity;

  return (
    <article className={styles.line}>
      <Link
        className={styles.imageWrap}
        href={`/products/${encodeURIComponent(line.product.id)}`}
        aria-label={`View ${line.product.name}`}
      >
        {imageFailed ? (
          <span className={styles.imageFallback}>Image unavailable</span>
        ) : (
          <Image
            className={styles.image}
            src={line.product.imageUrl}
            alt=""
            fill
            sizes="8rem"
            onError={() => setImageFailed(true)}
          />
        )}
      </Link>

      <div className={styles.lineContent}>
        <div>
          <Link
            className={styles.productName}
            href={`/products/${encodeURIComponent(line.product.id)}`}
          >
            {line.product.name}
          </Link>
          <p>{formatPrice(line.product.price)} each</p>
        </div>
        <div className={styles.lineActions}>
          <div
            className={styles.quantityStepper}
            aria-label={`Quantity for ${line.product.name}`}
            role="group"
          >
            <button
              aria-label={`Decrease quantity of ${line.product.name}`}
              className={styles.quantityButton}
              disabled={line.quantity === 1}
              onClick={() => decrementLine(line.id)}
              type="button"
            >
              <span aria-hidden="true">−</span>
            </button>
            <span
              aria-label={`Quantity: ${line.quantity}`}
              aria-live="polite"
              className={styles.quantity}
              role="status"
            >
              {line.quantity}
            </span>
            <button
              aria-label={`Increase quantity of ${line.product.name}`}
              className={styles.quantityButton}
              onClick={() => incrementLine(line.id)}
              type="button"
            >
              <span aria-hidden="true">+</span>
            </button>
          </div>
          <Button
            className={styles.removeButton}
            onClick={() => removeLine(line.id)}
            size="compact"
            variant="danger"
            aria-label={`Remove ${line.product.name} line from cart`}
          >
            Remove item
          </Button>
        </div>
      </div>

      <strong className={styles.lineTotal}>{formatPrice(lineTotal)}</strong>
    </article>
  );
}
