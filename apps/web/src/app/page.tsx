import styles from './page.module.scss';

export default function HomePage() {
  return (
    <main className={styles.main}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Workspace ready</p>
        <h1 className={styles.title}>Bite</h1>
        <p className={styles.description}>
          The ordering experience will take shape here, one verified milestone
          at a time.
        </p>
      </section>
    </main>
  );
}
