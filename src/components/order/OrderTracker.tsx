import { Check, X } from "lucide-react";
import { OrderStatus } from "@/types";
import { cn } from "@/utils/format";

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "Хүлээн авсан" },
  { key: "processing", label: "Бэлтгэж буй" },
  { key: "shipped", label: "Хүргэлтэд" },
  { key: "delivered", label: "Хүргэгдсэн" },
];

export function OrderTracker({ status }: { status: OrderStatus }) {
  if (status === "cancelled")
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600">
        <X size={16} /> Энэ захиалга цуцлагдсан байна.
      </div>
    );

  const current = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <div
            key={step.key}
            className="flex flex-1 items-center last:flex-none"
          >
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full border text-xs font-semibold transition-colors",
                  done
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-bg text-muted",
                )}
              >
                {done ? <Check size={15} /> : i + 1}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-[11px]",
                  active ? "font-semibold text-ink" : "text-muted",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  "mx-1 h-0.5 flex-1 rounded transition-colors",
                  i < current ? "bg-accent" : "bg-line",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
