'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { type Product } from '@bite/contracts';

import { formatPrice } from '@/shared/lib/format-price';

import styles from './ProductCard.module.scss';

type ProductCardProps = Readonly<{
  product: Product;
}>;

export function ProductCard({ product }: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className={styles.card}>
      <Link
        className={styles.link}
        href={`/products/${encodeURIComponent(product.id)}`}
        aria-label={`View ${product.name}`}
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
              sizes="(max-width: 44rem) 100vw, (max-width: 72rem) 50vw, 33vw"
              onError={() => setImageFailed(true)}
            />
          )}
          <span className={styles.price}>{formatPrice(product.price)}</span>
        </div>
        <div className={styles.content}>
          <h2 className={styles.name}>{product.name}</h2>
          <p className={styles.description}>{product.description}</p>
          <span className={styles.action} aria-hidden="true">
            View item <span>→</span>
          </span>
        </div>
      </Link>
    </article>
  );
}
