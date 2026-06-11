import { Product } from "@/types";
import { ProductGrid } from "./ProductGrid";

export function RelatedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return (
    <section className="mt-20">
      <h3 className="mb-8 font-display text-2xl font-bold text-ink">Холбоотой бүтээгдэхүүн</h3>
      <ProductGrid products={products} />
    </section>
  );
}
