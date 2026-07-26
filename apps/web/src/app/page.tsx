import { type Product } from '@bite/contracts';

import { fetchProducts } from '@/entities/product';
import { ProductCatalog } from '@/widgets/product-catalog';

export const revalidate = 300;

export default async function HomePage() {
  let initialProducts: Product[] | undefined;

  try {
    initialProducts = await fetchProducts();
  } catch {
    // The client query preserves the existing retry and error experience.
  }

  return <ProductCatalog initialProducts={initialProducts} />;
}
