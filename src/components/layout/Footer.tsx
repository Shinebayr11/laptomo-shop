import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { SITE } from "@/constants/site";
import { CATEGORIES } from "@/constants/categories";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-1">
          <h3 className="font-display text-3xl font-bold text-ink">{SITE.name}<span className="text-accent">.</span></h3>
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
            <li><Link href="/cart" className="hover:text-accent">Сагс</Link></li>
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
