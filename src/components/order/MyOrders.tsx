"use client";
import { useOrders } from "@/store/OrdersContext";
import { OrderTracker } from "./OrderTracker";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatMNT, formatDate } from "@/utils/format";

export function MyOrders({ userId }: { userId: string }) {
  const { ordersForUser, ready } = useOrders();
  if (!ready) return <p className="text-sm text-muted">Ачааллаж байна...</p>;

  const orders = ordersForUser(userId);
  if (!orders.length)
    return (
      <EmptyState
        title="Захиалга алга"
        hint="Та одоогоор захиалга хийгээгүй байна. Дэлгүүрээс сонгоод үзээрэй."
      />
    );

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <article key={o.id} className="rounded-xl2 border border-line p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
            <div>
              <p className="font-display text-lg text-ink">{o.id}</p>
              <p className="text-xs text-muted">{formatDate(o.created_at)}</p>
            </div>
            <p className="font-medium text-ink">{formatMNT(o.total_price)}</p>
          </div>

          <ul className="space-y-1 py-4 text-sm">
            {o.items.map((it) => (
              <li key={it.product_id} className="flex justify-between">
                <span className="text-ink">
                  {it.title} × {it.quantity}
                </span>
                <span className="text-muted">
                  {formatMNT(it.price * it.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <OrderTracker status={o.status} />
        </article>
      ))}
    </div>
  );
}
