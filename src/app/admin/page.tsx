"use client";
import {
  Archive,
  Package,
  PackageX,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useAdmin } from "@/store/AdminContext";
import { StatCard } from "@/components/admin/StatCard";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { LOW_STOCK_THRESHOLD } from "@/constants/site";
import { formatMNT, formatDate } from "@/utils/format";

export default function AdminDashboardPage() {
  const { products, archivedProducts, orders, reviews, ready } = useAdmin();
  if (!ready) return <p className="text-sm text-muted">Ачааллаж байна...</p>;

  const totalSales = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total_price, 0);
  const customers = new Set(orders.map((o) => o.user_id).filter(Boolean)).size;
  const recent = orders.slice(0, 5);

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStock = products
    .filter((p) => p.stock <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stock - b.stock);
  const outOfStock = lowStock.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold text-ink">Хяналтын самбар</h1>
        <p className="mt-1 text-sm text-muted">Дэлгүүрийн ерөнхий үзүүлэлт</p>
      </header>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
        <StatCard label="Бүтээгдэхүүн" value={String(products.length)} icon={Package} hint="Идэвхтэй нэр төрөл" />
        <Link href="/admin/archive" className="block h-full">
          <StatCard label="Архив" value={String(archivedProducts.length)} icon={Archive} hint="Нуусан бараа" />
        </Link>
        <Link href="/admin/products" className="block h-full">
          <StatCard
            label="Нөөц дуусаж буй"
            value={String(lowStock.length)}
            icon={PackageX}
            hint={
              outOfStock > 0
                ? `${outOfStock} бараа бүрэн дууссан`
                : `${LOW_STOCK_THRESHOLD} ба түүнээс бага үлдэгдэлтэй`
            }
          />
        </Link>
        <StatCard label="Захиалга" value={String(orders.length)} icon={ShoppingCart} hint="Нийт захиалга" />
        <StatCard label="Хэрэглэгч" value={String(customers)} icon={Users} hint="Худалдан авсан" />
        <StatCard label="Орлого" value={formatMNT(totalSales)} icon={Wallet} hint="Цуцлагдсанаас бусад" />
        <StatCard label="Нийт үлдэгдэл" value={`${totalStock} ш`} icon={Package} hint="Идэвхтэй барааны нийлбэр" />
      </div>

      {lowStock.length > 0 && (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between border-b border-amber-500/20 px-5 py-4">
            <h2 className="font-display text-xl text-ink">Нөөц дүүргэх шаардлагатай</h2>
            <Link href="/admin/products" className="text-xs uppercase tracking-wide2 text-accent hover:underline">
              Бүтээгдэхүүн рүү
            </Link>
          </div>
          <div className="divide-y divide-amber-500/15">
            {lowStock.slice(0, 6).map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                <span className="min-w-0 text-ink">{p.title}</span>
                <span className={p.stock === 0 ? "font-semibold text-red-600" : "font-medium text-amber-600"}>
                  {p.stock === 0 ? "Дууссан" : `${p.stock} ширхэг үлдсэн`}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

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
