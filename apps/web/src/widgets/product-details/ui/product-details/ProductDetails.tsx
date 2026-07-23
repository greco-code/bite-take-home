'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { useProductQuery } from '@/entities/product';
import { ApiError } from '@/shared/api';
import { formatPrice } from '@/shared/lib/format-price';
import { StatusPanel } from '@/shared/ui/status-panel';

import styles from './ProductDetails.module.scss';

type ProductDetailsProps = Readonly<{
  productId: string;
}>;

export function ProductDetails({ productId }: ProductDetailsProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const {
    data: product,
    error,
    isError,
    isPending,
    refetch,
  } = useProductQuery(productId);

  if (isPending) {
    return (
      <main className={styles.main} id="main-content" aria-busy="true">
        <p className={styles.backPlaceholder}>Loading item…</p>
        <div className={styles.skeleton} aria-label="Loading item details">
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonLineShort} />
            <div className={styles.skeletonLineWide} />
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
          </div>
        </div>
      </main>
    );
  }

  if (isError) {
    const isNotFound = error instanceof ApiError && error.status === 404;

    return (
      <main className={styles.main} id="main-content">
        <Link className={styles.backLink} href="/">
          ← Back to menu
        </Link>
        <StatusPanel
          eyebrow={isNotFound ? 'Item not found' : 'Item unavailable'}
          title={
            isNotFound
              ? 'That item isn’t on the menu.'
              : 'We couldn’t load this item.'
          }
          description={
            isNotFound
              ? 'It may have moved or left the menu. Head back to see what is available.'
              : 'The kitchen may be briefly offline. Check your connection and try once more.'
          }
          {...(!isNotFound && {
            onRetry: () => void refetch(),
          })}
        />
      </main>
    );
  }

  return (
    <main className={styles.main} id="main-content">
      <Link className={styles.backLink} href="/">
        ← Back to menu
      </Link>
      <article className={styles.product}>
        <div className={styles.imageWrap}>
          {imageFailed ? (
            <span className={styles.imageFallback}>Image unavailable</span>
          ) : (
            <Image
              className={styles.image}
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 52rem) 100vw, 52vw"
              onError={() => setImageFailed(true)}
            />
          )}
        </div>
        <div className={styles.content}>
          <p className={styles.eyebrow}>Made for right now</p>
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.description}>{product.description}</p>
          <div className={styles.divider} />
          <div className={styles.priceRow}>
            <span>Price</span>
            <strong>{formatPrice(product.price)}</strong>
          </div>
        </div>
      </article>
    </main>
  );
}
