import type { Metadata } from 'next';

import { CartPage } from '@/widgets/cart-page';

export const metadata: Metadata = {
  title: 'Your cart',
};

export default function CartRoute() {
  return <CartPage />;
}
