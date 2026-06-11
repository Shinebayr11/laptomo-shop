import { PackageOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "./Button";

export function EmptyState({ title, hint, actionLabel, actionHref }: { title: string; hint?: string; actionLabel?: string; actionHref?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <PackageOpen className="text-muted" size={48} strokeWidth={1} />
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      {hint && <p className="max-w-sm text-sm text-muted">{hint}</p>}
      {actionLabel && actionHref && (
        <Link href={actionHref}><Button variant="outline" size="sm">{actionLabel}</Button></Link>
      )}
    </div>
  );
}
