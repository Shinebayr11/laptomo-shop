"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, LayoutDashboard, Package, ShoppingCart, Star, Store } from "lucide-react";
import { SITE } from "@/constants/site";
import { cn } from "@/utils/format";

const LINKS = [
  { href: "/admin", label: "Хяналтын самбар", icon: LayoutDashboard },
  { href: "/admin/products", label: "Бүтээгдэхүүн", icon: Package },
  { href: "/admin/archive", label: "Архив", icon: Archive },
  { href: "/admin/orders", label: "Захиалга", icon: ShoppingCart },
  { href: "/admin/reviews", label: "Сэтгэгдэл", icon: Star },
];

export function AdminSidebar() {
  const path = usePathname();
  return (
    <aside className="flex gap-1 overflow-x-auto border-b border-line pb-4 lg:self-stretch lg:flex-col lg:gap-2 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
      <Link href="/" aria-label={`${SITE.name} нүүр`} className="mb-2 hidden px-4 lg:block">
        <span className="block">
          <Image
            src="/brand/ls-tech-store-logo-v4.png"
            alt={SITE.name}
            width={176}
            height={39}
            sizes="176px"
            className="h-12 w-44 object-contain object-left mix-blend-multiply dark:hidden"
          />
          <Image
            src="/brand/ls-tech-store-dark-logo-v4.png"
            alt=""
            width={176}
            height={40}
            sizes="176px"
            className="hidden h-12 w-44 object-contain object-left mix-blend-screen dark:block"
          />
        </span>
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
