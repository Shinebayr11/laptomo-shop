import { Product } from "@/types";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeader } from "./SectionHeader";

export function ProductSection({ eyebrow, title, products, href }: { eyebrow?: string; title: string; products: Product[]; href?: string }) {
  if (!products.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <SectionHeader eyebrow={eyebrow} title={title} href={href} linkLabel="Бүгдийг үзэх" />
      <ProductGrid products={products.slice(0, 4)} />
    </section>
  );
}
