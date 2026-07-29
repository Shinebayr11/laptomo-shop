"use client";

export function AdminError({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss: () => void;
}) {
  if (!message) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3">
      <p className="text-sm text-red-500">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="text-xs font-medium uppercase tracking-wide2 text-muted hover:text-ink"
      >
        Хаах
      </button>
    </div>
  );
}
