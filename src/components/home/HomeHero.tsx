import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/types";

const HERO_PRODUCT_SLUG = "14-triple-portable-monitor";
const COLUMN_ANIMATIONS = ["animate-marquee-up", "animate-marquee-down", "animate-marquee-up"];

function splitIntoColumns(products: Product[], count: number): Product[][] {
  const columns: Product[][] = Array.from({ length: count }, () => []);
  // Багана бүрд хамгийн багадаа ~5 плитка байх ёстой, эс бөгөөс гүйлт
  // хэт хурдан давтагдаж харагдана — цөөвтэр бараатай үед жагсаалтаа давтана.
  const minPerColumn = 5;
  const needed = count * minPerColumn;
  const source: Product[] = [];
  while (source.length < needed && products.length) {
    source.push(...products);
  }
  source.forEach((p, i) => columns[i % count].push(p));
  return columns;
}

function MarqueeColumn({ products, animationClass }: { products: Product[]; animationClass: string }) {
  const doubled = [...products, ...products];
  return (
    <div className="h-full overflow-hidden">
      <div className={`flex flex-col gap-3 ${animationClass}`}>
        {doubled.map((p, i) => (
          <div
            key={`${p.id}-${i}`}
            className="relative aspect-square w-full shrink-0 overflow-hidden rounded-xl2 bg-white"
          >
            <Image
              src={p.images[0]}
              alt={p.title}
              fill
              sizes="180px"
              className="object-contain p-3"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeHero({ products }: { products: Product[] }) {
  const heroProduct =
    products.find((product) => product.slug === HERO_PRODUCT_SLUG) ??
    products.find((product) => product.images[0]);

  if (!heroProduct) return null;

  const columns = splitIntoColumns(products, 3);

  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-zinc-950">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      <div className="pointer-events-none absolute -left-40 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-purple-700/20 blur-[120px]" />

      <div className="relative z-10 mx-auto grid max-w-screen-2xl items-center gap-10 px-5 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-wide2 text-purple-200">
            LS Tech Store
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[0.98] tracking-tightest text-white sm:text-6xl sm:leading-[0.95] xl:text-7xl">
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

        <div className="relative h-[420px] rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm sm:h-[480px] lg:h-[560px]">
          <div className="grid h-full grid-cols-3 gap-3">
            {columns.map((col, i) =>
              col.length ? (
                <MarqueeColumn key={i} products={col} animationClass={COLUMN_ANIMATIONS[i % COLUMN_ANIMATIONS.length]} />
              ) : null,
            )}
          </div>
          <div className="pointer-events-none absolute inset-x-3 top-3 h-16 rounded-t-2xl bg-gradient-to-b from-zinc-950 to-transparent" />
          <div className="pointer-events-none absolute inset-x-3 bottom-3 h-16 rounded-b-2xl bg-gradient-to-t from-zinc-950 to-transparent" />
        </div>
      </div>
    </section>
  );
}
