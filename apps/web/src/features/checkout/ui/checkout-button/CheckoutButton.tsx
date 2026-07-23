'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { useCart } from '@/entities/cart';
import { saveOrderReceiptToken } from '@/entities/order';
import { Button } from '@/shared/ui/button';

import { cacheCompletedOrder, useCheckoutMutation } from '../../model';

import styles from './CheckoutButton.module.scss';

export function CheckoutButton() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isNavigating, startNavigation] = useTransition();
  const { clearCart, lines } = useCart();
  const { error, isPending, mutate, reset } = useCheckoutMutation();

  const completeOrder = () => {
    reset();
    mutate(
      {
        lines: lines.map((line) => ({
          productId: line.product.id,
          quantity: line.quantity,
        })),
      },
      {
        onSuccess: ({ order, receiptToken }) => {
          cacheCompletedOrder(queryClient, order);
          saveOrderReceiptToken(order.id, receiptToken);
          startNavigation(() => {
            clearCart();
            router.push(`/orders/${order.id}`);
          });
        },
      },
    );
  };

  return (
    <div className={styles.checkout}>
      <Button
        aria-describedby={error ? 'checkout-error' : undefined}
        className={styles.button}
        disabled={isPending || isNavigating || lines.length === 0}
        onClick={completeOrder}
      >
        {isPending
          ? 'Completing order…'
          : isNavigating
            ? 'Opening receipt…'
            : 'Complete order'}
      </Button>
      {error ? (
        <p className={styles.error} id="checkout-error" role="alert">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}
