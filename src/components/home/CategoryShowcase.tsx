"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Category, Product } from "@/types";
import { SectionHeader } from "./SectionHeader";

export function CategoryShowcase({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const items = categories.flatMap((category) => {
    const categoryProducts = products.filter(
      (product) => product.category === category.slug && product.images[0],
    );
    const product =
      categoryProducts.find((item) => item.is_featured) ?? categoryProducts[0];
    return product
      ? [{ category, image: product.images[0], productTitle: product.title }]
      : [];
  });

  if (!items.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <SectionHeader eyebrow="Ангилал" title="Юу хайж байна вэ?" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(({ category: c, image, productTitle }) => (
          <Link
            key={c.slug}
            href={`/products?category=${c.slug}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl2"
          >
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={image}
                alt={`${c.name} — ${productTitle}`}
                fill
                sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 25vw"
                className="bg-white object-contain p-5 transition-transform duration-700 group-hover:scale-105"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
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
