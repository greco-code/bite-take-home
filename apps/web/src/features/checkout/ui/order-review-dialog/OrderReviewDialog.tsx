'use client';

import { type RefObject, useEffect, useRef } from 'react';

import { type OrderPreviewResponse } from '@bite/contracts';

import { type CartLine } from '@/entities/cart';
import { formatPrice } from '@/shared/lib/format-price';
import { Button } from '@/shared/ui/button';

import styles from './OrderReviewDialog.module.scss';

type OrderReviewDialogProps = Readonly<{
  cartLines: readonly CartLine[];
  checkoutError: Error | null;
  isCheckoutPending: boolean;
  isOpen: boolean;
  isPreviewPending: boolean;
  notice: string | null;
  onBack: () => void;
  onConfirm: () => void;
  onRetryPreview: () => void;
  preview: OrderPreviewResponse | undefined;
  previewError: Error | null;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}>;

export function OrderReviewDialog({
  cartLines,
  checkoutError,
  isCheckoutPending,
  isOpen,
  isPreviewPending,
  notice,
  onBack,
  onConfirm,
  onRetryPreview,
  preview,
  previewError,
  returnFocusRef,
}: OrderReviewDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
      returnFocusRef.current?.focus();
    }
  }, [isOpen, returnFocusRef]);

  const availableLines =
    preview?.lines.filter((line) => line.status === 'available') ?? [];
  const unavailableLines =
    preview?.lines.filter((line) => line.status === 'unavailable') ?? [];
  const canConfirm =
    preview !== undefined &&
    availableLines.length > 0 &&
    !isPreviewPending &&
    !isCheckoutPending;

  return (
    <dialog
      aria-describedby="order-review-description"
      aria-labelledby="order-review-title"
      aria-modal="true"
      className={styles.dialog}
      onCancel={(event) => {
        if (isCheckoutPending) {
          event.preventDefault();
          return;
        }

        event.preventDefault();
        onBack();
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') {
          return;
        }

        event.preventDefault();

        if (!isCheckoutPending) {
          onBack();
        }
      }}
      ref={dialogRef}
    >
      <div
        aria-busy={isPreviewPending || isCheckoutPending}
        className={styles.panel}
      >
        <header className={styles.header}>
          <p className={styles.eyebrow}>Final check</p>
          <h2 id="order-review-title">Review your order</h2>
          <p id="order-review-description">
            We’ll check live availability and prices before completing it.
          </p>
        </header>

        {notice ? (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        ) : null}

        {isPreviewPending ? (
          <div className={styles.loading} role="status">
            Checking every item…
          </div>
        ) : null}

        {!isPreviewPending && previewError ? (
          <div className={styles.error} role="alert">
            <strong>We couldn’t review this order.</strong>
            <p>
              Your cart is unchanged. Check your connection and try the review
              again.
            </p>
            <Button onClick={onRetryPreview} variant="secondary">
              Retry review
            </Button>
          </div>
        ) : null}

        {!isPreviewPending && preview ? (
          <div className={styles.review}>
            {availableLines.length > 0 ? (
              <section aria-labelledby="available-items-title">
                <h3 id="available-items-title">Included items</h3>
                <ul className={styles.lines}>
                  {availableLines.map((line) => (
                    <li className={styles.line} key={line.position}>
                      <span>
                        <strong>{line.name}</strong>
                        <small>
                          {line.quantity} × {formatPrice(line.unitPrice)}
                        </small>
                      </span>
                      <strong>{formatPrice(line.lineTotal)}</strong>
                    </li>
                  ))}
                </ul>
              </section>
            ) : (
              <div className={styles.error} role="alert">
                <strong>Nothing in this cart is available right now.</strong>
                <p>Return to your cart to remove these items or browse again.</p>
              </div>
            )}

            {unavailableLines.length > 0 ? (
              <section
                aria-labelledby="unavailable-items-title"
                className={styles.unavailable}
              >
                <h3 id="unavailable-items-title">Unavailable items</h3>
                <p>These won’t be included in your order.</p>
                <ul>
                  {unavailableLines.map((line) => (
                    <li key={line.position}>
                      {cartLines[line.position - 1]?.product.name ??
                        `Product ${line.productId}`}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div className={styles.total}>
              <span>Order total</span>
              <strong>{formatPrice(preview.total)}</strong>
            </div>
          </div>
        ) : null}

        {checkoutError ? (
          <div className={styles.error} role="alert">
            <strong>We couldn’t complete your order.</strong>
            <p>{checkoutError.message}</p>
          </div>
        ) : null}

        <footer className={styles.actions}>
          <Button
            autoFocus
            disabled={isCheckoutPending}
            onClick={onBack}
            variant="secondary"
          >
            Back to cart
          </Button>
          <Button disabled={!canConfirm} onClick={onConfirm}>
            {isCheckoutPending
              ? 'Completing order…'
              : unavailableLines.length > 0
                ? 'Complete without unavailable items'
                : 'Complete order'}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
