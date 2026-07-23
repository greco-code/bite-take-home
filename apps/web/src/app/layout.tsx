import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { QueryProvider } from '@/app/providers/query-provider';
import { CartProvider } from '@/entities/cart';
import { SiteHeader } from '@/widgets/site-header';

import './globals.scss';

export const metadata: Metadata = {
  title: {
    default: 'Bite',
    template: '%s | Bite',
  },
  description: 'A simple online ordering experience.',
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <CartProvider>
            <SiteHeader />
            {children}
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
