import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/constants/categories";
import { SectionHeader } from "./SectionHeader";

export function CategoryShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <SectionHeader eyebrow="Ангилал" title="Юу хайж байна вэ?" />
      <div className="grid gap-5 md:grid-cols-3">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/products?category=${c.slug}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl2"
          >
            <Image src={c.image} alt={c.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h3 className="font-display text-2xl font-bold">{c.name}</h3>
              <p className="mt-1 text-sm text-white/75">{c.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
