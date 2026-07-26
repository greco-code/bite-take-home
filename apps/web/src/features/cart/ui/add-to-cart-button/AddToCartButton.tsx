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

  return (
    <Button
      className={cn(className)}
      onClick={() => addProduct(product)}
      aria-label={`Add to cart: ${product.name}`}
    >
      Add to cart
    </Button>
  );
}
