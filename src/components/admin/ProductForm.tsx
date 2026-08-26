"use client";
import { FormEvent, useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { Product } from "@/types";
import { CATEGORIES, findCategory } from "@/constants/categories";
import { BRANDS } from "@/constants/site";
import { uploadProductImage } from "@/lib/admin-data";
import { cn } from "@/utils/format";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    setUploadError("");
    try {
      const uploaded = await Promise.all(
        Array.from(files).map((file) => uploadProductImage(file, p.id)),
      );
      set("images", [...p.images, ...uploaded]);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Зураг upload хийхэд алдаа гарлаа.",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (idx: number) => {
    set("images", p.images.filter((_, i) => i !== idx));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
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

        <form className="space-y-4" onSubmit={submit}>
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
          <Field label="Зураг">
            <div className="space-y-3">
              {p.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {p.images.map((src, i) => (
                    <div key={src + i} className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-contain p-1" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        aria-label="Зураг устгах"
                        className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <label
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-medium uppercase tracking-wide2 text-ink transition-colors hover:border-accent hover:text-accent",
                    uploading && "pointer-events-none opacity-50",
                  )}
                >
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {uploading ? "Ачааллаж байна..." : "Зураг сонгох"}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </label>
                {uploadError && <span className="text-xs text-red-500">{uploadError}</span>}
              </div>

              <details className="text-xs text-muted">
                <summary className="cursor-pointer select-none">эсвэл URL холбоосоор нэмэх</summary>
                <Area
                  className="mt-2"
                  value={p.images.join("\n")}
                  onChange={(e) => set("images", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
                  placeholder="https://..."
                />
              </details>
            </div>
          </Field>

          <SpecEditor specs={p.specifications} onChange={(s) => set("specifications", s)} />

          <div className="flex flex-wrap gap-4 pt-1 text-sm text-ink">
            <label className="flex items-center gap-2"><input type="checkbox" checked={p.is_featured} onChange={(e) => set("is_featured", e.target.checked)} /> Онцлох</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={p.is_new} onChange={(e) => set("is_new", e.target.checked)} /> Шинэ</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={p.is_bestseller} onChange={(e) => set("is_bestseller", e.target.checked)} /> Эрэлттэй</label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Болих</Button>
            <Button type="submit" size="sm" disabled={!p.title || !p.price}>Хадгалах</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
