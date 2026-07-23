'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { consumeCatalogOrigin } from '../../model/catalog-origin';

import styles from './BackToCatalogLink.module.scss';

export function BackToCatalogLink() {
  const router = useRouter();

  return (
    <Link
      className={styles.link}
      href="/"
      onNavigate={(event) => {
        if (!consumeCatalogOrigin()) {
          return;
        }

        event.preventDefault();
        router.back();
      }}
    >
      ← Back to menu
    </Link>
  );
}
