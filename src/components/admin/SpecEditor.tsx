"use client";
import { Plus, X } from "lucide-react";
import { Spec } from "@/types";
import { TextInput } from "./AdminField";

export function SpecEditor({ specs, onChange }: { specs: Spec[]; onChange: (s: Spec[]) => void }) {
  const update = (i: number, key: keyof Spec, val: string) =>
    onChange(specs.map((s, idx) => (idx === i ? { ...s, [key]: val } : s)));
  const add = () => onChange([...specs, { label: "", value: "" }]);
  const remove = (i: number) => onChange(specs.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wide2 text-muted">Үзүүлэлт (specs)</span>
      {specs.map((s, i) => (
        <div key={i} className="flex gap-2">
          <TextInput placeholder="Нэр (ж: RAM)" value={s.label} onChange={(e) => update(i, "label", e.target.value)} />
          <TextInput placeholder="Утга (ж: 16GB)" value={s.value} onChange={(e) => update(i, "value", e.target.value)} />
          <button type="button" onClick={() => remove(i)} className="shrink-0 rounded-lg border border-line px-3 text-muted hover:text-red-600" aria-label="Устгах">
            <X size={15} />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline">
        <Plus size={14} /> Үзүүлэлт нэмэх
      </button>
    </div>
  );
}
