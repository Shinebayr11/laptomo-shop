"use client";
import { Package, ShoppingCart, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { useAdmin } from "@/store/AdminContext";
import { StatCard } from "@/components/admin/StatCard";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { formatMNT, formatDate } from "@/utils/format";

export default function AdminDashboardPage() {
  const { products, orders, reviews, ready } = useAdmin();
  if (!ready) return <p className="text-sm text-muted">Ачааллаж байна...</p>;

  const totalSales = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total_price, 0);
  const customers = new Set(orders.map((o) => o.user_id)).size;
  const recent = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold text-ink">Хяналтын самбар</h1>
        <p className="mt-1 text-sm text-muted">Дэлгүүрийн ерөнхий үзүүлэлт</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Бүтээгдэхүүн" value={String(products.length)} icon={Package} hint="Нийт нэр төрөл" />
        <StatCard label="Захиалга" value={String(orders.length)} icon={ShoppingCart} hint="Нийт захиалга" />
        <StatCard label="Хэрэглэгч" value={String(customers)} icon={Users} hint="Худалдан авсан" />
        <StatCard label="Орлого" value={formatMNT(totalSales)} icon={Wallet} hint="Цуцлагдсанаас бусад" />
      </div>

      <section className="rounded-2xl border border-line">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-xl text-ink">Сүүлийн захиалга</h2>
          <Link href="/admin/orders" className="text-xs uppercase tracking-wide2 text-accent hover:underline">
            Бүгдийг харах
          </Link>
        </div>
        <div className="divide-y divide-line">
          {recent.map((o) => (
            <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
              <div>
                <p className="font-medium text-ink">{o.id} · {o.customer_name}</p>
                <p className="text-xs text-muted">{formatDate(o.created_at)}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium text-ink">{formatMNT(o.total_price)}</span>
                <OrderStatusBadge status={o.status} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-muted">Нийт {reviews.length} сэтгэгдэл бүртгэгдсэн.</p>
    </div>
  );
}
