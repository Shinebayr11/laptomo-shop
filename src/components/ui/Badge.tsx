import { cn } from "@/utils/format";

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "accent" | "sale" | "new" }) {
  const tones = {
    neutral: "bg-surface text-muted",
    accent: "bg-accent text-white",
    sale: "bg-red-600 text-white",
    new: "bg-ink text-bg",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide2", tones[tone])}>
      {children}
    </span>
  );
}
