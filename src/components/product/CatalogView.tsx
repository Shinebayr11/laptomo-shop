"use client";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Product, ProductFilters } from "@/types";
import { filterProducts, emptyFilters } from "@/utils/filter";
import { FilterSidebar } from "@/components/filters/FilterSidebar";
import { SortDropdown } from "@/components/filters/SortDropdown";
import { ProductGrid } from "./ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";

export function CatalogView({ products, initial }: { products: Product[]; initial: Partial<ProductFilters> }) {
  const [filters, setFilters] = useState<ProductFilters>({ ...emptyFilters, ...initial });
  const [openMobile, setOpenMobile] = useState(false);

  const update = (patch: Partial<ProductFilters>) => setFilters((f) => ({ ...f, ...patch }));
  const reset = () => setFilters(emptyFilters);
  const results = useMemo(() => filterProducts(products, filters), [products, filters]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tightest text-ink">Бүтээгдэхүүн</h1>
          <p className="mt-1 text-sm text-muted">{results.length} бараа олдлоо</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setOpenMobile(true)} className="flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm lg:hidden">
            <SlidersHorizontal size={15} /> Шүүлтүүр
          </button>
          <SortDropdown value={filters.sort} onChange={(sort) => update({ sort })} />
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[230px_1fr]">
        <div className="hidden lg:block"><FilterSidebar filters={filters} update={update} reset={reset} /></div>
        <div>
          {results.length ? <ProductGrid products={results} /> : (
            <EmptyState title="Бараа олдсонгүй" hint="Шүүлтүүрээ өөрчилж дахин оролдоно уу." actionLabel="Шүүлтүүр цэвэрлэх" actionHref="/products" />
          )}
        </div>
      </div>

      {openMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenMobile(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-bg p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl text-ink">Шүүлтүүр</h2>
              <button onClick={() => setOpenMobile(false)}><X size={20} /></button>
            </div>
            <FilterSidebar filters={filters} update={update} reset={reset} />
          </div>
        </div>
      )}
    </div>
  );
}
