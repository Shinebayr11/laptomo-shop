import { Spec } from "@/types";

export function ProductSpecs({ specs }: { specs: Spec[] }) {
  if (!specs?.length) return null;
  return (
    <div className="mt-10">
      <h3 className="mb-4 font-display text-xl text-ink">Үзүүлэлт</h3>
      <dl className="divide-y divide-line rounded-xl2 border border-line">
        {specs.map((s) => (
          <div key={s.label} className="flex justify-between px-5 py-3 text-sm">
            <dt className="text-muted">{s.label}</dt>
            <dd className="font-medium text-ink">{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
