import Link from 'next/link';

import styles from './SiteHeader.module.scss';

export function SiteHeader() {
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
          <p className={styles.tagline}>Simple food. Good mood.</p>
        </div>
      </header>
    </>
  );
}
