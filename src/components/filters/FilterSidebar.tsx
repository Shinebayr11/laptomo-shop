"use client";
import { CATEGORIES } from "@/constants/categories";
import { BRANDS } from "@/constants/site";
import { ProductFilters } from "@/types";
import { cn } from "@/utils/format";

interface Props {
  filters: ProductFilters;
  update: (patch: Partial<ProductFilters>) => void;
  reset: () => void;
}

export function FilterSidebar({ filters, update, reset }: Props) {
  const active = CATEGORIES.find((c) => c.slug === filters.category);
  return (
    <aside className="space-y-8">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide2 text-ink">Ангилал</h3>
          <button onClick={reset} className="text-xs text-accent hover:underline">Цэвэрлэх</button>
        </div>
        <ul className="space-y-2 text-sm">
          <li><button onClick={() => update({ category: "", subcategory: "" })} className={cn("hover:text-accent", !filters.category ? "text-accent" : "text-muted")}>Бүгд</button></li>
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <button onClick={() => update({ category: c.slug, subcategory: "" })} className={cn("hover:text-accent", filters.category === c.slug ? "text-accent" : "text-muted")}>{c.name}</button>
            </li>
          ))}
        </ul>
      </div>

      {active && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide2 text-ink">Дэд ангилал</h3>
          <ul className="space-y-2 text-sm">
            {active.subcategories.map((s) => (
              <li key={s.slug}>
                <button onClick={() => update({ subcategory: filters.subcategory === s.slug ? "" : s.slug })} className={cn("hover:text-accent", filters.subcategory === s.slug ? "text-accent" : "text-muted")}>{s.name}</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide2 text-ink">Брэнд</h3>
        <select value={filters.brand} onChange={(e) => update({ brand: e.target.value })} className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-accent">
          <option value="">Бүх брэнд</option>
          {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide2 text-ink">Үнэ (₮)</h3>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Доод" value={filters.minPrice ?? ""} onChange={(e) => update({ minPrice: e.target.value ? +e.target.value : null })} className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-accent" />
          <span className="text-muted">—</span>
          <input type="number" placeholder="Дээд" value={filters.maxPrice ?? ""} onChange={(e) => update({ maxPrice: e.target.value ? +e.target.value : null })} className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-accent" />
        </div>
      </div>
    </aside>
  );
}
