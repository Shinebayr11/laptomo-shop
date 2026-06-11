import { LucideIcon } from "lucide-react";

export function StatCard({ label, value, icon: Icon, hint }: { label: string; value: string; icon: LucideIcon; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface/40 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide2 text-muted">{label}</span>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-accent/10 text-accent">
          <Icon size={17} />
        </span>
      </div>
      <p className="mt-4 font-display text-3xl font-semibold text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
