'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type ReactNode, useState } from 'react';

import { type Product } from '@bite/contracts';

import { formatPrice } from '@/shared/lib/format-price';

import styles from './ProductCard.module.scss';

type ProductCardProps = Readonly<{
  action?: ReactNode;
  onNavigate: () => void;
  preload?: boolean;
  product: Product;
}>;

export function ProductCard({
  action,
  onNavigate,
  preload = false,
  product,
}: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const formattedPrice = formatPrice(product.price);

  return (
    <article className={styles.card}>
      <Link
        className={styles.imageLink}
        href={`/products/${encodeURIComponent(product.id)}`}
        aria-label={`View ${product.name}, ${formattedPrice}`}
        onNavigate={onNavigate}
      >
        <div className={styles.imageWrap}>
          {imageFailed ? (
            <span className={styles.imageFallback}>Image unavailable</span>
          ) : (
            <Image
              className={styles.image}
              src={product.imageUrl}
              alt=""
              fill
              preload={preload}
              sizes="(max-width: 44rem) 100vw, (max-width: 72rem) 50vw, 33vw"
              onError={() => setImageFailed(true)}
            />
          )}
          <span className={styles.price}>{formattedPrice}</span>
        </div>
      </Link>
      <div className={styles.content}>
        <Link
          className={styles.detailsLink}
          href={`/products/${encodeURIComponent(product.id)}`}
          onNavigate={onNavigate}
        >
          <h2 className={styles.name}>{product.name}</h2>
          <p className={styles.description}>{product.description}</p>
        </Link>
        <div className={styles.actions}>
          <Link
            className={styles.viewAction}
            href={`/products/${encodeURIComponent(product.id)}`}
            onNavigate={onNavigate}
          >
            View details
          </Link>
          {action}
        </div>
      </div>
    </article>
  );
}
