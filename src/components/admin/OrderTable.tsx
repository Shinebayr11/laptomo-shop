"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Order, OrderStatus } from "@/types";
import { formatMNT, formatDate, cn } from "@/utils/format";
import { OrderStatusBadge, STATUS_LABELS } from "./OrderStatusBadge";

const STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

export function OrderTable({ orders, onStatus }: { orders: Order[]; onStatus: (id: string, s: OrderStatus) => void }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="rounded-2xl border border-line">
          <button onClick={() => setOpenId(openId === o.id ? null : o.id)} className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left">
            <div>
              <p className="font-medium text-ink">{o.id} · {o.customer_name}</p>
              <p className="text-xs text-muted">{formatDate(o.created_at)} · {o.customer_phone}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium text-ink">{formatMNT(o.total_price)}</span>
              <OrderStatusBadge status={o.status} />
              <ChevronDown size={16} className={cn("text-muted transition-transform", openId === o.id && "rotate-180")} />
            </div>
          </button>

          {openId === o.id && (
            <div className="border-t border-line px-5 py-4 text-sm">
              <p className="mb-2 text-muted">Хүргэх хаяг: <span className="text-ink">{o.address}</span></p>
              <ul className="mb-4 space-y-1">
                {o.items.map((it) => (
                  <li key={it.product_id} className="flex justify-between">
                    <span className="text-ink">{it.title} × {it.quantity}</span>
                    <span className="text-muted">{formatMNT(it.price * it.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-wide2 text-muted">Төлөв:</span>
                <select value={o.status} onChange={(e) => onStatus(o.id, e.target.value as OrderStatus)} className="cursor-pointer rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-accent">
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
