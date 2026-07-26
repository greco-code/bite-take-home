import { type Product } from '@bite/contracts';
import { notFound } from 'next/navigation';

import { fetchProduct } from '@/entities/product';
import { ApiError } from '@/shared/api';
import { ProductDetails } from '@/widgets/product-details';

type ProductPageProps = Readonly<{
  params: Promise<{
    productId: string;
  }>;
}>;

export const revalidate = 300;

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;
  let initialProduct: Product | undefined;

  try {
    initialProduct = await fetchProduct(productId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    // The client query preserves the existing retry and error experience.
  }

  return (
    <ProductDetails initialProduct={initialProduct} productId={productId} />
  );
}
