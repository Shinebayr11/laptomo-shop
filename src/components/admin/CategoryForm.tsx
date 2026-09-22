"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { CategoryRow } from "@/types";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, Area, Select } from "./AdminField";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9Ѐ-ӿ]+/g, "-").replace(/^-+|-+$/g, "");

const blank = (): CategoryRow => ({
  id: crypto.randomUUID(),
  slug: "",
  name: "",
  description: "",
  image: "",
  parent_slug: null,
  created_at: new Date().toISOString(),
});

export function CategoryForm({
  initial,
  parents,
  onSave,
  onClose,
}: {
  initial?: CategoryRow;
  /** Эцэг сонгох жагсаалт — зөвхөн үндсэн ангиллууд, засаж буй мөрөө хасна. */
  parents: CategoryRow[];
  onSave: (c: CategoryRow) => void;
  onClose: () => void;
}) {
  const [c, setC] = useState<CategoryRow>(initial ?? blank());
  const set = <K extends keyof CategoryRow>(k: K, v: CategoryRow[K]) =>
    setC((prev) => ({ ...prev, [k]: v }));
  const isSub = c.parent_slug !== null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const slug = c.slug || slugify(c.name);
    onSave({
      ...c,
      slug,
      description: isSub ? "" : c.description,
      image: isSub ? "" : c.image,
    });
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-bg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">{initial ? "Ангилал засах" : "Шинэ ангилал"}</h2>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={20} /></button>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          <Field label="Эцэг ангилал">
            <Select
              value={c.parent_slug ?? ""}
              onChange={(e) => set("parent_slug", e.target.value || null)}
            >
              <option value="">— (Үндсэн ангилал)</option>
              {parents
                .filter((p) => p.slug !== c.slug)
                .map((p) => (
                  <option key={p.slug} value={p.slug}>{p.name}</option>
                ))}
            </Select>
          </Field>

          <Field label="Нэр">
            <TextInput
              value={c.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="ж: Гурвалсан дэлгэц"
            />
          </Field>

          <Field label="Slug (URL-д ашиглагдана, хоосон бол нэрнээс автоматаар үүснэ)">
            <TextInput
              value={c.slug}
              onChange={(e) => set("slug", slugify(e.target.value))}
              placeholder="ж: triple"
            />
          </Field>

          {!isSub && (
            <>
              <Field label="Тайлбар">
                <Area
                  value={c.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Нүүр хуудсанд харагдах товч тайлбар"
                />
              </Field>
              <Field label="Зургийн URL">
                <TextInput
                  value={c.image}
                  onChange={(e) => set("image", e.target.value)}
                  placeholder="https://..."
                />
              </Field>
            </>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Болих</Button>
            <Button type="submit" size="sm" disabled={!c.name}>Хадгалах</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
