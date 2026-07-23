import { ProductDetails } from '@/widgets/product-details';

type ProductPageProps = Readonly<{
  params: Promise<{
    productId: string;
  }>;
}>;

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;

  return <ProductDetails productId={productId} />;
}
