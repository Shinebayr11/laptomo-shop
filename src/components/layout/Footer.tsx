import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { SITE } from "@/constants/site";
import { CATEGORIES } from "@/constants/categories";
import { AuthenticatedCartLink } from "./AuthenticatedCartLink";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-4 lg:px-8">
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
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{SITE.description}</p>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide2 text-ink">Ангилал</h4>
          <ul className="space-y-3 text-sm text-muted">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/products?category=${c.slug}`} className="hover:text-accent">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide2 text-ink">Холбоос</h4>
          <ul className="space-y-3 text-sm text-muted">
            <li><Link href="/products" className="hover:text-accent">Бүх бүтээгдэхүүн</Link></li>
            <li><Link href="/account" className="hover:text-accent">Миний бүртгэл</Link></li>
            <AuthenticatedCartLink />
            <li><Link href="/admin" className="hover:text-accent">Админ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide2 text-ink">Холбоо барих</h4>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex items-center gap-2"><Phone size={15} className="text-accent" />{SITE.phone}</li>
            <li className="flex items-center gap-2"><Mail size={15} className="text-accent" />{SITE.email}</li>
            <li className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 text-accent" />{SITE.address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} {SITE.name}. Бүх эрх хуулиар хамгаалагдсан.
      </div>
    </footer>
  );
}
