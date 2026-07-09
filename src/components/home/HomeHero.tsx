import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/types";

export function HomeHero({ products }: { products: Product[] }) {
  const heroProduct = products.find((product) => product.images[0]);

  if (!heroProduct) return null;

  return (
    <section className="relative isolate min-h-[620px] overflow-hidden border-b border-line bg-zinc-950">
      <div className="absolute inset-y-0 right-0 w-full sm:w-[72%] lg:w-[62%]">
        <Image
          src={heroProduct.images[0]}
          alt={heroProduct.title}
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 72vw, 62vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/45 to-zinc-950/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/45 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[620px] max-w-screen-2xl items-center px-5 py-16 lg:px-8">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-wide2 text-purple-200">
            LS Tech Store
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold leading-[0.95] tracking-tightest text-white sm:text-6xl xl:text-7xl">
            Премиум технологи.
            <span className="block text-purple-300">Ухаалаг сонголт.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-200 sm:text-lg">
            Laptop, monitor болон хэрэгслийг баталгаатай, хурдан хүргэлттэйгээр
            нэг дороос сонго.
          </p>
          <p className="mt-4 text-sm font-medium text-purple-200">
            {heroProduct.brand} · {heroProduct.title}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-purple-200"
            >
              Бүтээгдэхүүн үзэх
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/products?sort=newest"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-purple-300 hover:text-purple-200"
            >
              Шинэ бараа
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
