import type { Metadata } from 'next';

import { RouteFallback } from './_ui/route-fallback';

export const metadata: Metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return (
    <RouteFallback
      eyebrow="404 · Order not found"
      title="This page isn’t on the menu."
      description="The link may be outdated, or the item may no longer be available. Head back to the menu to find something delicious."
    />
  );
}
