import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { SITE } from "@/constants/site";
import { Category } from "@/types";
import { AuthenticatedCartLink } from "./AuthenticatedCartLink";

export function Footer({ categories }: { categories: Category[] }) {
  return (
    <footer className="mt-16 border-t border-line bg-surface md:mt-24">
      <div className="mx-auto max-w-7xl px-4 py-8 md:hidden">
        <Link href="/" aria-label={`${SITE.name} нүүр`} className="inline-block">
          <span className="block">
            <Image
              src="/brand/ls-tech-store-logo-v4.png"
              alt={SITE.name}
              width={176}
              height={39}
              sizes="176px"
              className="h-10 w-44 object-contain object-left mix-blend-multiply dark:hidden"
            />
            <Image
              src="/brand/ls-tech-store-dark-logo-v4.png"
              alt=""
              width={176}
              height={40}
              sizes="176px"
              className="hidden h-10 w-44 object-contain object-left mix-blend-screen dark:block"
            />
          </span>
        </Link>

        <nav className="mt-5 grid grid-cols-2 gap-2 text-sm">
          <Link
            href="/products"
            className="rounded-xl border border-line bg-bg px-3 py-3 text-center font-medium text-ink"
          >
            Бүтээгдэхүүн
          </Link>
          <Link
            href="/account"
            className="rounded-xl border border-line bg-bg px-3 py-3 text-center font-medium text-ink"
          >
            Миний бүртгэл
          </Link>
        </nav>

        <div className="mt-5 space-y-2 border-t border-line pt-5 text-sm text-muted">
          <a
            href={`tel:${SITE.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-2.5 hover:text-accent"
          >
            <Phone size={16} className="shrink-0 text-accent" />
            {SITE.phone}
          </a>
          <a
            href={`mailto:${SITE.email}`}
            className="flex min-w-0 items-center gap-2.5 hover:text-accent"
          >
            <Mail size={16} className="shrink-0 text-accent" />
            <span className="truncate">{SITE.email}</span>
          </a>
        </div>

        <p className="mt-6 text-xs text-muted">
          © {new Date().getFullYear()} {SITE.name}
        </p>
      </div>

      <div className="mx-auto hidden max-w-7xl gap-10 px-5 py-14 md:grid md:grid-cols-2 lg:grid-cols-4 lg:gap-12 lg:px-8 lg:py-16">
        <div className="lg:col-span-1">
          <Link href="/" aria-label={`${SITE.name} нүүр`} className="block">
            <span className="block">
              <Image
                src="/brand/ls-tech-store-logo-v4.png"
                alt={SITE.name}
                width={256}
                height={56}
                sizes="256px"
                className="h-14 w-64 max-w-full object-contain object-left mix-blend-multiply dark:hidden"
              />
              <Image
                src="/brand/ls-tech-store-dark-logo-v4.png"
                alt=""
                width={256}
                height={58}
                sizes="256px"
                className="hidden h-14 w-64 max-w-full object-contain object-left mix-blend-screen dark:block"
              />
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            {SITE.description}
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide2 text-ink">
            Ангилал
          </h4>
          <ul className="space-y-3 text-sm text-muted">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/products?category=${c.slug}`}
                  className="hover:text-accent"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide2 text-ink">
            Холбоос
          </h4>
          <ul className="space-y-3 text-sm text-muted">
            <li>
              <Link href="/products" className="hover:text-accent">
                Бүх бүтээгдэхүүн
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-accent">
                Миний бүртгэл
              </Link>
            </li>
            <AuthenticatedCartLink />
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide2 text-ink">
            Холбоо барих
          </h4>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex items-center gap-2">
              <Phone size={15} className="text-accent" />
              {SITE.phone}
            </li>
            <li className="flex items-center gap-2">
              <Mail size={15} className="text-accent" />
              <a href={`mailto:${SITE.email}`} className="hover:text-accent">
                {SITE.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={15} className="mt-0.5 text-accent" />
              {SITE.address}
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
