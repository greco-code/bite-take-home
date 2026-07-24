'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useTransition } from 'react';

import { useCart } from '@/entities/cart';
import { saveOrderReceiptToken } from '@/entities/order';
import { Button } from '@/shared/ui/button';

import {
  cacheCompletedOrder,
  getCheckoutErrorContent,
  useCheckoutMutation,
} from '../../model';

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
  const { clearCart, lines } = useCart();
  const isMounted = useRef(false);
  const { error, isPending, mutate, reset } = useCheckoutMutation({
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
  const errorContent = error ? getCheckoutErrorContent(error) : null;

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

  const completeOrder = () => {
    onCheckoutStart();
    reset();
    mutate({
      lines: lines.map((line) => ({
        productId: line.product.id,
        quantity: line.quantity,
      })),
    });
  };

  return (
    <div className={styles.checkout}>
      <Button
        aria-describedby={errorContent ? 'checkout-error' : undefined}
        className={styles.button}
        disabled={isPending || isNavigating || lines.length === 0}
        onClick={completeOrder}
      >
        {isPending
          ? 'Completing order…'
          : isNavigating
            ? 'Opening receipt…'
            : errorContent
              ? 'Try again'
              : 'Complete order'}
      </Button>
      {errorContent ? (
        <div className={styles.error} id="checkout-error" role="alert">
          <strong>{errorContent.title}</strong>
          <p>{errorContent.message}</p>
        </div>
      ) : null}
    </div>
  );
}
