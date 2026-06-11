"use client";
import { SORT_OPTIONS } from "@/constants/site";
import { SortKey } from "@/types";

export function SortDropdown({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortKey)}
      className="rounded-full border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>Эрэмбэлэх: {o.label}</option>
      ))}
    </select>
  );
}
