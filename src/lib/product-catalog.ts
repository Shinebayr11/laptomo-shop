import { SEED_PRODUCTS } from "@/data/products";
import { Product } from "@/types";

export function mergeWithSeedProducts(products: Product[]): Product[] {
  const seen = new Set(products.flatMap((product) => [product.id, product.slug]));
  const missingSeeds = SEED_PRODUCTS.filter(
    (product) => !seen.has(product.id) && !seen.has(product.slug),
  );

  return [...products, ...missingSeeds].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}
