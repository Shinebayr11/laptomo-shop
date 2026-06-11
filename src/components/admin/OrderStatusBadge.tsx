import { OrderStatus } from "@/types";
import { cn } from "@/utils/format";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Хүлээгдэж буй",
  processing: "Бэлтгэж буй",
  shipped: "Хүргэлтэд гарсан",
  delivered: "Хүргэгдсэн",
  cancelled: "Цуцлагдсан",
};

const STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-500/15 text-amber-600",
  processing: "bg-blue-500/15 text-blue-600",
  shipped: "bg-violet-500/15 text-violet-600",
  delivered: "bg-emerald-500/15 text-emerald-600",
  cancelled: "bg-red-500/15 text-red-600",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-[11px] font-semibold", STYLES[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}
