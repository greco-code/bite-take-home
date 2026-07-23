import styles from './StatusPanel.module.scss';

type StatusPanelProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  onRetry?: () => void;
}>;

export function StatusPanel({
  eyebrow,
  title,
  description,
  onRetry,
}: StatusPanelProps) {
  return (
    <section className={styles.panel} aria-live="polite">
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      {onRetry ? (
        <button className={styles.button} type="button" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </section>
  );
}
