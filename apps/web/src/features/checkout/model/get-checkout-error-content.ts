import { ApiError } from '@/shared/api';

export type CheckoutErrorContent = Readonly<{
  message: string;
  title: string;
}>;

const fallbackContent: CheckoutErrorContent = {
  title: 'We could not complete your order.',
  message: 'Your cart is still saved. Please try again.',
};

export const getCheckoutErrorContent = (
  error: unknown,
): CheckoutErrorContent => {
  if (!(error instanceof ApiError)) {
    return fallbackContent;
  }

  if (error.code === 'PRODUCT_UNAVAILABLE') {
    return {
      title: 'Your cart needs an update.',
      message: error.message,
    };
  }

  if (error.code === 'INVALID_REQUEST') {
    return {
      title: 'We could not submit this cart.',
      message: error.message,
    };
  }

  if (
    error.code === 'NETWORK_ERROR' ||
    error.code === 'INVALID_RESPONSE' ||
    error.status >= 500
  ) {
    return {
      title: 'We could not confirm your order.',
      message:
        'Your cart is still saved. Check your connection and wait a moment before trying again.',
    };
  }

  return fallbackContent;
};
