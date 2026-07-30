'use client';

import { type Product } from '@bite/contracts';

import { useCart } from '@/entities/cart';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';

type AddToCartButtonProps = Readonly<{
  product: Product;
  className?: string;
}>;

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const { addProduct } = useCart();
  const isUnavailable = product.status === 'unavailable';

  return (
    <Button
      className={cn(className)}
      disabled={isUnavailable}
      onClick={() => addProduct(product)}
      aria-label={
        isUnavailable
          ? `${product.name} is unavailable`
          : `Add to cart: ${product.name}`
      }
    >
      {isUnavailable ? 'Unavailable' : 'Add to cart'}
    </Button>
  );
}
