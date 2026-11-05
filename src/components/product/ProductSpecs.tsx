import { Spec } from "@/types";

export function ProductSpecs({ specs }: { specs: Spec[] }) {
  if (!specs?.length) return null;
  return (
    <div className="mt-10">
      <h3 className="mb-4 font-display text-xl text-ink">Үзүүлэлт</h3>
      <dl className="divide-y divide-line rounded-xl2 border border-line">
        {specs.map((s) => (
          <div key={s.label} className="flex flex-col gap-1 px-5 py-3 text-sm sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-muted">{s.label}</dt>
            <dd className="break-words font-medium text-ink sm:text-right">{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
