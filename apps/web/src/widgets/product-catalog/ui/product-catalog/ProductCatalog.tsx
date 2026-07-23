'use client';

import { ProductCard, useProductsQuery } from '@/entities/product';
import { StatusPanel } from '@/shared/ui/status-panel';

import styles from './ProductCatalog.module.scss';

const skeletonItems = Array.from({ length: 6 }, (_, index) => index);

export function ProductCatalog() {
  const {
    data: products,
    isError,
    isFetching,
    isPending,
    refetch,
  } = useProductsQuery();

  return (
    <main className={styles.main} id="main-content">
      <section className={styles.hero} aria-labelledby="catalog-title">
        <div>
          <p className={styles.eyebrow}>Good food, ready when you are</p>
          <h1 className={styles.title} id="catalog-title">
            Pick your next favorite.
          </h1>
        </div>
        <p className={styles.intro}>
          A short menu of bright salads, satisfying snacks, and something sweet
          for later.
        </p>
      </section>

      {isPending ? (
        <section
          className={styles.grid}
          aria-label="Loading menu"
          aria-busy="true"
        >
          {skeletonItems.map((item) => (
            <div className={styles.skeleton} key={item} aria-hidden="true">
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonLineWide} />
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLineShort} />
            </div>
          ))}
        </section>
      ) : null}

      {isError ? (
        <StatusPanel
          eyebrow="Menu unavailable"
          title="We couldn’t load the menu."
          description="The kitchen may be briefly offline. Check your connection and try once more."
          onRetry={() => void refetch()}
        />
      ) : null}

      {!isError && products?.length === 0 ? (
        <StatusPanel
          eyebrow="Nothing on the pass"
          title="The menu is empty right now."
          description="Please check back soon while we prepare the next batch."
        />
      ) : null}

      {!isError && products && products.length > 0 ? (
        <section aria-label="Menu items">
          <div className={styles.resultMeta}>
            <p>{products.length} items</p>
            {isFetching ? (
              <span role="status">Refreshing menu…</span>
            ) : (
              <span>All prices shown in USD</span>
            )}
          </div>
          <div className={styles.grid}>
            {products.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
