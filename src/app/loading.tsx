export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-4">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
        <p className="text-xs uppercase tracking-wide2 text-muted">Ачааллаж байна...</p>
      </div>
    </div>
  );
}
