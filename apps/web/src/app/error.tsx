'use client';

import { useEffect } from 'react';

import { RouteFallback } from './_ui/route-fallback';

type ErrorPageProps = Readonly<{
  error: Error & { digest?: string };
  unstable_retry: () => void;
}>;

export default function ErrorPage({ error, unstable_retry }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <RouteFallback
      eyebrow="Something went wrong"
      title="We dropped the order."
      description="A temporary problem stopped this page from loading. Try it once more, or return to the menu."
      onRetry={unstable_retry}
    />
  );
}
