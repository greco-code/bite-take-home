const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export const formatPrice = (priceInCents: number): string =>
  currencyFormatter.format(priceInCents / 100);
