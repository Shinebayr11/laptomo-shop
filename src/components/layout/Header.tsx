"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { NAV_LINKS, SITE } from "@/constants/site";
import { ThemeToggle } from "./ThemeToggle";
import { CartIndicator } from "./CartIndicator";
import { cn } from "@/utils/format";
import { AccountMenu } from "./AccountMenu";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/products?query=${encodeURIComponent(q)}`);
    setOpen(false);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-line bg-bg/85 backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 lg:px-8">
        <Link
          href="/"
          className="font-display text-2xl font-bold tracking-tightest text-ink"
        >
          {SITE.name}
          <span className="text-accent">.</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <form onSubmit={submit} className="hidden items-center md:flex">
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
            className="grid h-9 w-9 place-items-center text-ink lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Цэс"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-bg px-5 py-6 lg:hidden">
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
