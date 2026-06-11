"use client";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import { Product } from "@/types";
import { findCategory } from "@/constants/categories";
import { formatMNT, effectivePrice } from "@/utils/format";

export function ProductTable({ products, onEdit, onDelete }: { products: Product[]; onEdit: (p: Product) => void; onDelete: (p: Product) => void }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-line bg-surface/40 text-left text-xs uppercase tracking-wide2 text-muted">
          <tr>
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
                  <button onClick={() => onDelete(p)} className="rounded-lg border border-line p-2 text-muted hover:text-red-600" aria-label="Устгах"><Trash2 size={15} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
