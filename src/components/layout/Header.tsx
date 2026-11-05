"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Grid2X2,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { NAV_LINKS, SITE } from "@/constants/site";
import { Category } from "@/types";
import { ThemeToggle } from "./ThemeToggle";
import { CartIndicator } from "./CartIndicator";
import { AccountMenu } from "./AccountMenu";

export function Header({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();
  const links = [
    ...NAV_LINKS,
    ...categories.map((category) => ({
      href: `/products?category=${category.slug}`,
      label: category.name,
    })),
  ];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/products?query=${encodeURIComponent(q)}`);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-3 px-4 py-2.5 sm:px-5 lg:px-8">
        <Link
          href="/"
          aria-label={`${SITE.name} нүүр`}
          className="shrink-0"
        >
          <span className="block">
            <Image
              src="/brand/ls-tech-store-logo-v4.png"
              alt={SITE.name}
              width={208}
              height={46}
              priority
              sizes="(max-width: 640px) 160px, (max-width: 1536px) 176px, 208px"
              className="h-10 w-40 object-contain mix-blend-multiply dark:hidden sm:w-44 2xl:w-52"
            />
            <Image
              src="/brand/ls-tech-store-dark-logo-v4.png"
              alt=""
              width={208}
              height={47}
              priority
              sizes="(max-width: 640px) 160px, (max-width: 1536px) 176px, 208px"
              className="hidden h-10 w-40 object-contain mix-blend-screen dark:block sm:w-44 2xl:w-52"
            />
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-3 xl:flex 2xl:gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap text-[12px] text-muted transition-colors hover:text-ink 2xl:text-[13px]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <form onSubmit={submit} className="hidden items-center 2xl:flex">
            <div className="flex items-center gap-2 rounded-full border border-line px-4 py-2">
              <Search size={15} className="text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Хайх..."
                className="w-28 bg-transparent text-sm outline-none placeholder:text-muted"
              />
            </div>
          </form>
          <ThemeToggle />
          <div className="max-sm:[&>div>a:first-child]:hidden">
            <CartIndicator />
          </div>
          <div className="hidden sm:block">
            <AccountMenu />
          </div>
          <button
            className="grid h-9 w-9 place-items-center rounded-full text-ink transition-colors hover:bg-surface hover:text-accent xl:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Цэс"
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-navigation"
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-bg shadow-lg xl:hidden"
        >
          <div className="mx-auto max-w-screen-2xl px-4 py-4 sm:px-5">
            <form
              onSubmit={submit}
              className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3"
            >
              <Search size={17} className="shrink-0 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Бүтээгдэхүүн хайх..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
              />
            </form>

            <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wide2 text-muted">
              Үндсэн цэс
            </p>
            <nav className="grid grid-cols-2 gap-2">
              {[
                { href: "/products", label: "Бүтээгдэхүүн", icon: Grid2X2 },
                { href: "/wishlist", label: "Хадгалсан", icon: Heart },
                { href: "/cart", label: "Сагс", icon: ShoppingBag },
                { href: "/account", label: "Миний бүртгэл", icon: UserRound },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center gap-2.5 rounded-xl border border-line bg-surface px-3 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
                  >
                    <Icon size={17} className="shrink-0 text-accent" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wide2 text-muted">
              Ангилал
            </p>
            <nav className="grid grid-cols-2 gap-x-3 gap-y-1">
              {categories.map((category) => (
              <Link
                  key={category.slug}
                  href={`/products?category=${category.slug}`}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-2.5 text-sm leading-snug text-ink transition-colors hover:bg-surface hover:text-accent"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
