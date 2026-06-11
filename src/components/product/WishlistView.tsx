"use client";
import { Product } from "@/types";
import { useWishlist } from "@/store/WishlistContext";
import { ProductGrid } from "./ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";

export function WishlistView({ products }: { products: Product[] }) {
  const { ids, ready } = useWishlist();
  if (!ready) return null;
  const saved = products.filter((p) => ids.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <h1 className="mb-8 font-display text-4xl font-bold tracking-tightest text-ink">Хадгалсан бараа</h1>
      {saved.length === 0 ? (
        <EmptyState title="Хадгалсан бараа алга" hint="Зүрхэн дээр дарж дуртай бараагаа хадгалаарай." actionLabel="Дэлгүүр үзэх" actionHref="/products" />
      ) : (
        <ProductGrid products={saved} />
      )}
    </div>
  );
}
