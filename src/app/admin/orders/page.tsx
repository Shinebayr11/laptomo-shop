"use client";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { OrderStatus } from "@/types";
import { useAdmin } from "@/store/AdminContext";
import { OrderTable } from "@/components/admin/OrderTable";
import { STATUS_LABELS } from "@/components/admin/OrderStatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/utils/format";

const FILTERS: (OrderStatus | "all")[] = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const { orders, ordersError, ready, setOrderStatus, refreshOrders } = useAdmin();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [refreshing, setRefreshing] = useState(false);

  if (!ready) return <p className="text-sm text-muted">Ачааллаж байна...</p>;

  const shown = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-ink">Захиалга</h1>
        <p className="mt-1 text-sm text-muted">Нийт {orders.length} захиалга · төлөв шинэчлэх боломжтой</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("rounded-full px-4 py-2 text-xs font-medium transition-colors", filter === f ? "bg-ink text-bg" : "border border-line text-muted hover:text-ink")}>
            {f === "all" ? "Бүгд" : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {ordersError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3">
          <p className="text-sm text-red-500">{ordersError}</p>
          <button
            type="button"
            disabled={refreshing}
            onClick={async () => {
              setRefreshing(true);
              try {
                await refreshOrders();
              } finally {
                setRefreshing(false);
              }
            }}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-line px-4 text-xs font-medium uppercase tracking-wide2 text-ink disabled:opacity-40"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            Дахин татах
          </button>
        </div>
      )}

      {shown.length ? (
        <OrderTable
          orders={shown}
          onStatus={(id, status) => {
            // Алдааг ordersError дээр харуулна — unhandled rejection үүсгэхгүй.
            void setOrderStatus(id, status).catch(() => {});
          }}
        />
      ) : (
        <EmptyState title="Захиалга алга" hint="Энэ төлөвт захиалга байхгүй байна." />
      )}
    </div>
  );
}
