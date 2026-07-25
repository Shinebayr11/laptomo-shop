import { LucideIcon } from "lucide-react";

export function StatCard({ label, value, icon: Icon, hint }: { label: string; value: string; icon: LucideIcon; hint?: string }) {
  return (
    <div className="flex h-full min-h-[150px] flex-col rounded-2xl border border-line bg-surface/40 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0 flex-1 break-words text-[11px] font-medium uppercase leading-5 tracking-[0.14em] text-muted">
          {label}
        </span>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
          <Icon size={17} />
        </span>
      </div>
      <p className="mt-auto break-words pt-5 font-display text-3xl font-semibold leading-none text-ink">
        {value}
      </p>
      {hint && <p className="mt-2 text-sm leading-5 text-muted">{hint}</p>}
    </div>
  );
}
