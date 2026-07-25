"use client";
import Image from "next/image";
import { Archive, Pencil } from "lucide-react";
import { Product } from "@/types";
import { findCategory } from "@/constants/categories";
import { formatMNT, effectivePrice } from "@/utils/format";

export function ProductTable({
  products,
  selectedIds,
  allSelected,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onArchive,
}: {
  products: Product[];
  selectedIds: string[];
  allSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onEdit: (p: Product) => void;
  onArchive: (p: Product) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="border-b border-line bg-surface/40 text-left text-xs uppercase tracking-wide2 text-muted">
          <tr>
            <th className="w-12 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                aria-label="Бүгдийг сонгох"
                className="h-4 w-4 rounded border-line accent-accent"
              />
            </th>
            <th className="px-4 py-3 font-medium">Бүтээгдэхүүн</th>
            <th className="px-4 py-3 font-medium">Ангилал</th>
            <th className="px-4 py-3 font-medium">Үнэ</th>
            <th className="px-4 py-3 font-medium">Нөөц</th>
            <th className="px-4 py-3 text-right font-medium">Үйлдэл</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-surface/30">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(p.id)}
                  onChange={() => onToggleSelect(p.id)}
                  aria-label={`${p.title} сонгох`}
                  className="h-4 w-4 rounded border-line accent-accent"
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface">
                    {p.images[0] && <Image src={p.images[0]} alt={p.title} fill className="object-cover" sizes="44px" />}
                  </div>
                  <span className="line-clamp-1 font-medium text-ink">{p.title}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-muted">{findCategory(p.category)?.name ?? p.category}</td>
              <td className="px-4 py-3 text-ink">{formatMNT(effectivePrice(p.price, p.discount_price))}</td>
              <td className="px-4 py-3">
                <span className={p.stock > 0 ? "text-emerald-600" : "text-red-600"}>{p.stock > 0 ? `${p.stock} ширхэг` : "Дууссан"}</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(p)} className="rounded-lg border border-line p-2 text-muted hover:text-accent" aria-label="Засах"><Pencil size={15} /></button>
                  <button onClick={() => onArchive(p)} className="rounded-lg border border-line p-2 text-muted hover:text-amber-600" aria-label="Архивлах"><Archive size={15} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
