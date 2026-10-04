"use client";
import { useState } from "react";
import Image from "next/image";
import { RotateCcw, Search } from "lucide-react";
import { useAdmin } from "@/store/AdminContext";
import { AdminError } from "@/components/admin/AdminError";
import { TextInput } from "@/components/admin/AdminField";
import { EmptyState } from "@/components/ui/EmptyState";
import { effectivePrice, formatDate, formatMNT } from "@/utils/format";
import { CategoryRow, Product } from "@/types";

export default function AdminArchivePage() {
  const {
    archivedProducts,
    categories,
    archivedCategories,
    ready,
    restoreProduct,
    restoreCategories,
    actionError,
    clearActionError,
  } = useAdmin();
  const [q, setQ] = useState("");

  if (!ready) return <p className="text-sm text-muted">Ачааллаж байна...</p>;

  const categoryName = (slug: string) =>
    [...categories, ...archivedCategories].find((c) => c.slug === slug)?.name ??
    slug;

  const normalizedQuery = q.trim().toLowerCase();
  const filteredProducts = archivedProducts.filter((p) =>
    p.title.toLowerCase().includes(q.toLowerCase()),
  );
  const filteredCategories = archivedCategories.filter((category) =>
    category.name.toLowerCase().includes(normalizedQuery),
  );

  const handleRestore = (p: Product) => {
    if (confirm(`"${p.title}"-г буцааж идэвхтэй болгох уу?`)) {
      restoreProduct(p.id);
    }
  };

  const handleRestoreCategory = (category: CategoryRow) => {
    const childIds = archivedCategories
      .filter((item) => item.parent_slug === category.slug)
      .map((item) => item.id);
    const parent = category.parent_slug
      ? archivedCategories.find((item) => item.slug === category.parent_slug)
      : undefined;
    const ids = Array.from(
      new Set([category.id, ...childIds, ...(parent ? [parent.id] : [])]),
    );
    if (confirm(`"${category.name}"-г буцааж идэвхтэй болгох уу?`)) {
      restoreCategories(ids);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Архив</h1>
          <p className="mt-1 text-sm text-muted">
            {archivedProducts.length} бүтээгдэхүүн · {archivedCategories.length} ангилал
          </p>
        </div>
      </header>

      <AdminError message={actionError} onDismiss={clearActionError} />

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <TextInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Нэрээр хайх..."
          className="pl-9"
        />
      </div>

      {filteredProducts.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-xl text-ink">Бүтээгдэхүүн</h2>
          <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-line bg-surface/40 text-left text-xs uppercase tracking-wide2 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Бүтээгдэхүүн</th>
                <th className="px-4 py-3 font-medium">Ангилал</th>
                <th className="px-4 py-3 font-medium">Үнэ</th>
                <th className="px-4 py-3 font-medium">Нөөц</th>
                <th className="px-4 py-3 font-medium">Үүссэн огноо</th>
                <th className="px-4 py-3 text-right font-medium">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-surface/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface">
                        {p.images[0] && (
                          <Image
                            src={p.images[0]}
                            alt={p.title}
                            fill
                            className="object-cover"
                            sizes="44px"
                          />
                        )}
                      </div>
                      <span className="line-clamp-1 font-medium text-ink">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {categoryName(p.category)}
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {formatMNT(effectivePrice(p.price, p.discount_price))}
                  </td>
                  <td className="px-4 py-3">
                    <span className={p.stock > 0 ? "text-emerald-600" : "text-red-600"}>
                      {p.stock > 0 ? `${p.stock} ширхэг` : "Дууссан"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleRestore(p)}
                        className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-xs font-medium uppercase tracking-wide2 text-muted hover:border-emerald-500 hover:text-emerald-600"
                      >
                        <RotateCcw size={15} /> Сэргээх
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </section>
      )}

      {filteredCategories.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-xl text-ink">Ангилал</h2>
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="border-b border-line bg-surface/40 text-left text-xs uppercase tracking-wide2 text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Ангилал</th>
                  <th className="px-4 py-3 font-medium">Төрөл</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 text-right font-medium">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-surface/30">
                    <td className="px-4 py-3 font-medium text-ink">
                      {category.name}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {category.parent_slug
                        ? `Дэд · ${categoryName(category.parent_slug)}`
                        : "Үндсэн"}
                    </td>
                    <td className="px-4 py-3 text-muted">/{category.slug}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleRestoreCategory(category)}
                          className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-xs font-medium uppercase tracking-wide2 text-muted hover:border-emerald-500 hover:text-emerald-600"
                        >
                          <RotateCcw size={15} /> Сэргээх
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!filteredProducts.length && !filteredCategories.length && (
        <EmptyState
          title={normalizedQuery ? "Илэрц олдсонгүй" : "Архив хоосон байна"}
          hint={
            normalizedQuery
              ? "Хайлтын үгээ өөрчилж дахин оролдоно уу."
              : "Архивласан бүтээгдэхүүн болон ангилал энд харагдана."
          }
          actionLabel="Бүтээгдэхүүн рүү очих"
          actionHref="/admin/products"
        />
      )}
    </div>
  );
}
