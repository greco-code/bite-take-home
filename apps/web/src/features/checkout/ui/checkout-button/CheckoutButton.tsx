'use client';

import { useRouter } from 'next/navigation';

import { useCart } from '@/entities/cart';
import { saveOrderReceiptToken } from '@/entities/order';
import { Button } from '@/shared/ui/button';

import { useCheckoutMutation } from '../../model';

import styles from './CheckoutButton.module.scss';

export function CheckoutButton() {
  const router = useRouter();
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
          saveOrderReceiptToken(order.id, receiptToken);
          clearCart();
          router.push(`/orders/${order.id}`);
        },
      },
    );
  };

  return (
    <div className={styles.checkout}>
      <Button
        aria-describedby={error ? 'checkout-error' : undefined}
        className={styles.button}
        disabled={isPending || lines.length === 0}
        onClick={completeOrder}
      >
        {isPending ? 'Completing order…' : 'Complete order'}
      </Button>
      {error ? (
        <p className={styles.error} id="checkout-error" role="alert">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}
