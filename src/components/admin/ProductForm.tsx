"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { Product } from "@/types";
import { CATEGORIES, findCategory } from "@/constants/categories";
import { BRANDS } from "@/constants/site";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, Area, Select } from "./AdminField";
import { SpecEditor } from "./SpecEditor";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\u0400-\u04FF]+/g, "-").replace(/^-+|-+$/g, "");

const blank = (): Product => ({
  id: "p-" + Date.now(), title: "", slug: "", price: 0, discount_price: null, images: [],
  category: "laptop", subcategory: "macbook", brand: "Apple", description: "", specifications: [],
  stock: 0, rating: 0, reviews_count: 0, is_featured: false, is_new: true, is_bestseller: false,
  is_archived: false, created_at: new Date().toISOString(),
});

export function ProductForm({ initial, onSave, onClose }: { initial?: Product; onSave: (p: Product) => void; onClose: () => void }) {
  const [p, setP] = useState<Product>(initial ?? blank());
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((prev) => ({ ...prev, [k]: v }));
  const subs = findCategory(p.category)?.subcategories ?? [];

  const submit = () => {
    const slug = p.slug || slugify(p.title);
    onSave({ ...p, slug, subcategory: subs.some((s) => s.slug === p.subcategory) ? p.subcategory : subs[0]?.slug });
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-bg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">{initial ? "Бүтээгдэхүүн засах" : "Шинэ бүтээгдэхүүн"}</h2>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <Field label="Нэр"><TextInput value={p.title} onChange={(e) => set("title", e.target.value)} placeholder="ж: MacBook Pro 14 M3" /></Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Үнэ (₮)"><TextInput type="number" value={p.price || ""} onChange={(e) => set("price", Number(e.target.value))} /></Field>
            <Field label="Хямдралтай үнэ (₮, заавал биш)">
              <TextInput type="number" value={p.discount_price ?? ""} onChange={(e) => set("discount_price", e.target.value ? Number(e.target.value) : null)} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Ангилал">
              <Select value={p.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Дэд ангилал">
              <Select value={p.subcategory} onChange={(e) => set("subcategory", e.target.value)}>
                {subs.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
              </Select>
            </Field>
            <Field label="Брэнд">
              <Select value={p.brand} onChange={(e) => set("brand", e.target.value)}>
                {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </Select>
            </Field>
          </div>

          <Field label="Нөөц (ширхэг)"><TextInput type="number" value={p.stock || ""} onChange={(e) => set("stock", Number(e.target.value))} /></Field>
          <Field label="Тайлбар"><Area value={p.description} onChange={(e) => set("description", e.target.value)} /></Field>
          <Field label="Зургийн холбоос (мөр тус бүрт нэг URL)">
            <Area value={p.images.join("\n")} onChange={(e) => set("images", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} placeholder="https://..." />
          </Field>

          <SpecEditor specs={p.specifications} onChange={(s) => set("specifications", s)} />

          <div className="flex flex-wrap gap-4 pt-1 text-sm text-ink">
            <label className="flex items-center gap-2"><input type="checkbox" checked={p.is_featured} onChange={(e) => set("is_featured", e.target.checked)} /> Онцлох</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={p.is_new} onChange={(e) => set("is_new", e.target.checked)} /> Шинэ</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={p.is_bestseller} onChange={(e) => set("is_bestseller", e.target.checked)} /> Эрэлттэй</label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={onClose}>Болих</Button>
            <Button size="sm" onClick={submit} disabled={!p.title || !p.price}>Хадгалах</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
