import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/types";

export function HomeHero({ products }: { products: Product[] }) {
  const heroProduct = products.find((product) => product.images[0]);

  if (!heroProduct) return null;

  return (
    <section className="relative isolate min-h-[620px] overflow-hidden bg-[#eeeae5] dark:bg-[#24212a]">
      <Image
        src="/products/hero/triple-monitor-office-hero.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-right"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#c9c0b5]/94 via-[#d9d1c7]/68 to-white/5 dark:from-[#201d27]/90 dark:via-[#2d2934]/62 dark:to-[#40394a]/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/5 to-[#ded7cf]/5 dark:from-zinc-950 dark:via-transparent dark:to-white/5" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent dark:from-zinc-950" />

      <div className="relative z-10 mx-auto flex min-h-[620px] max-w-screen-2xl items-center px-5 py-16 lg:px-8 lg:py-24">
        <div className="max-w-xl rounded-3xl border border-stone-700/10 bg-[#d8d0c6]/65 p-6 shadow-2xl shadow-black/10 backdrop-blur-[3px] dark:border-transparent dark:bg-transparent dark:shadow-none dark:backdrop-blur-none sm:p-8 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
          <p className="text-xs font-semibold uppercase tracking-wide2 text-sky-700 dark:text-sky-300">
            LS Tech Store
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[0.98] tracking-tightest text-zinc-950 dark:text-white sm:text-6xl sm:leading-[0.95] xl:text-7xl">
            Танд хэрэгтэй технологи.
            <span className="block text-blue-900 dark:text-sky-300">Яг энд байна.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base font-medium leading-7 text-zinc-800 dark:text-white/90 sm:text-lg">
            Laptop, monitor болон хэрэгслийг баталгаатай, хурдан хүргэлттэйгээр
            нэг дороос сонго.
          </p>
          <p className="mt-4 text-sm font-medium text-sky-700 dark:text-sky-300">
            {[heroProduct.brand, heroProduct.title].filter(Boolean).join(" · ")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-white dark:text-zinc-950 dark:hover:bg-sky-100"
            >
              Бүтээгдэхүүн үзэх
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/products?sort=newest"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-900/30 px-5 py-3 text-sm font-medium text-zinc-900 transition-colors hover:border-blue-700 hover:text-blue-700 dark:border-white/30 dark:text-white dark:hover:border-sky-300 dark:hover:text-sky-300"
            >
              Шинэ бараа
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
