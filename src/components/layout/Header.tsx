"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { NAV_LINKS, SITE } from "@/constants/site";
import { ThemeToggle } from "./ThemeToggle";
import { CartIndicator } from "./CartIndicator";
import { AccountMenu } from "./AccountMenu";

export function Header() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();

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
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap text-[12px] text-muted transition-colors hover:text-ink 2xl:text-[13px]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
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
          <CartIndicator />
          <AccountMenu />
          <button
            className="grid h-9 w-9 place-items-center text-ink xl:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Цэс"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-bg px-5 py-6 xl:hidden">
          <form
            onSubmit={submit}
            className="mb-5 flex items-center gap-2 rounded-full border border-line px-4 py-2.5"
          >
            <Search size={16} className="text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Бүтээгдэхүүн хайх..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </form>
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-display text-lg text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
