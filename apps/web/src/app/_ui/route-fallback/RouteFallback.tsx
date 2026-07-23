'use client';

import Link from 'next/link';

import { Button } from '@/shared/ui/button';

import styles from './RouteFallback.module.scss';

type RouteFallbackProps = Readonly<{
  description: string;
  eyebrow: string;
  onRetry?: () => void;
  title: string;
}>;

export function RouteFallback({
  description,
  eyebrow,
  onRetry,
  title,
}: RouteFallbackProps) {
  return (
    <main className={styles.main} id="main-content">
      <section className={styles.panel} aria-labelledby="fallback-title">
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title} id="fallback-title">
          {title}
        </h1>
        <p className={styles.description}>{description}</p>
        <div className={styles.actions}>
          {onRetry ? <Button onClick={onRetry}>Try again</Button> : null}
          <Link
            className={onRetry ? styles.secondaryAction : styles.primaryAction}
            href="/"
          >
            Back to menu
          </Link>
        </div>
      </section>
    </main>
  );
}
