import { Product } from "@/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="fade-in-section grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4 lg:gap-x-8">
      {products.map((p, i) => (
        <div key={p.id} style={{ animationDelay: `${i * 60}ms` }}>
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}
