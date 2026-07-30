'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';

import { useCart } from '@/entities/cart';
import { saveOrderReceiptToken } from '@/entities/order';
import { ApiError } from '@/shared/api';
import { Button } from '@/shared/ui/button';

import {
  cacheCompletedOrder,
  useCheckoutMutation,
  useOrderPreviewMutation,
} from '../../model';
import { OrderReviewDialog } from '../order-review-dialog';

import styles from './CheckoutButton.module.scss';

type CheckoutButtonProps = Readonly<{
  onCheckoutStart: () => void;
  onPendingChange: (isPending: boolean) => void;
}>;

export function CheckoutButton({
  onCheckoutStart,
  onPendingChange,
}: CheckoutButtonProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isNavigating, startNavigation] = useTransition();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const { clearCart, lines } = useCart();
  const isMounted = useRef(false);
  const reviewButtonRef = useRef<HTMLButtonElement>(null);
  const previewMutation = useOrderPreviewMutation();
  const checkoutMutation = useCheckoutMutation({
    onError: (error) => {
      if (error instanceof ApiError && error.code === 'ORDER_REVIEW_REQUIRED') {
        setNotice(
          'Your order changed while you were reviewing it. Please confirm the latest items and total.',
        );
        previewMutation.mutate(createPreviewRequest(lines));
      }
    },
    onSuccess: ({ order, receiptToken }) => {
      cacheCompletedOrder(queryClient, order);
      saveOrderReceiptToken(order.id, receiptToken);
      clearCart();

      if (isMounted.current) {
        startNavigation(() => {
          router.push(`/orders/${order.id}`);
        });
      }
    },
  });
  const isPending = checkoutMutation.isPending;
  const isReviewRequired =
    checkoutMutation.error instanceof ApiError &&
    checkoutMutation.error.code === 'ORDER_REVIEW_REQUIRED';

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      onPendingChange(false);
    };
  }, [onPendingChange]);

  useEffect(() => {
    onPendingChange(isPending || isNavigating);
  }, [isNavigating, isPending, onPendingChange]);

  const openReview = () => {
    setNotice(null);
    checkoutMutation.reset();
    previewMutation.reset();
    setIsReviewOpen(true);
    previewMutation.mutate(createPreviewRequest(lines));
  };

  const closeReview = () => {
    if (isPending) {
      return;
    }

    setIsReviewOpen(false);
    setNotice(null);
    checkoutMutation.reset();
    previewMutation.reset();
  };

  const completeOrder = () => {
    const preview = previewMutation.data;

    if (!preview) {
      return;
    }

    onCheckoutStart();
    checkoutMutation.reset();
    checkoutMutation.mutate({
      lines: lines.map((line) => ({
        productId: line.product.id,
        quantity: line.quantity,
      })),
      reviewToken: preview.reviewToken,
      acceptUnavailableExclusions: true,
    });
  };

  return (
    <div className={styles.checkout}>
      <Button
        className={styles.button}
        disabled={isPending || isNavigating || lines.length === 0}
        onClick={openReview}
        ref={reviewButtonRef}
      >
        {isNavigating ? 'Opening receipt…' : 'Review order'}
      </Button>
      <OrderReviewDialog
        cartLines={lines}
        checkoutError={
          isReviewRequired ? null : (checkoutMutation.error ?? null)
        }
        isCheckoutPending={isPending || isNavigating}
        isOpen={isReviewOpen}
        isPreviewPending={previewMutation.isPending}
        notice={notice}
        onBack={closeReview}
        onConfirm={completeOrder}
        onRetryPreview={() => {
          setNotice(null);
          checkoutMutation.reset();
          previewMutation.mutate(createPreviewRequest(lines));
        }}
        preview={previewMutation.data}
        previewError={previewMutation.error}
        returnFocusRef={reviewButtonRef}
      />
    </div>
  );
}

const createPreviewRequest = (lines: ReturnType<typeof useCart>['lines']) => ({
  lines: lines.map((line) => ({
    productId: line.product.id,
    quantity: line.quantity,
  })),
});
