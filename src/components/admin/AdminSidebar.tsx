"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Star, Store } from "lucide-react";
import { cn } from "@/utils/format";

const LINKS = [
  { href: "/admin", label: "Хяналтын самбар", icon: LayoutDashboard },
  { href: "/admin/products", label: "Бүтээгдэхүүн", icon: Package },
  { href: "/admin/orders", label: "Захиалга", icon: ShoppingCart },
  { href: "/admin/reviews", label: "Сэтгэгдэл", icon: Star },
];

export function AdminSidebar() {
  const path = usePathname();
  return (
    <aside className="flex gap-1 overflow-x-auto border-b border-line pb-4 lg:flex-col lg:gap-2 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
      <Link href="/" className="mb-2 hidden items-center gap-2 px-4 font-display text-2xl font-bold text-ink lg:flex">
        Laptomo<span className="text-accent">.</span>
      </Link>
      {LINKS.map((l) => {
        const active = path === l.href;
        return (
          <Link key={l.href} href={l.href} className={cn("flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors lg:rounded-lg", active ? "bg-ink text-bg" : "text-muted hover:text-ink")}>
            <l.icon size={17} /> {l.label}
          </Link>
        );
      })}
      <Link href="/" className="mt-auto hidden items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-muted hover:text-ink lg:flex">
        <Store size={17} /> Дэлгүүр рүү буцах
      </Link>
    </aside>
  );
}
