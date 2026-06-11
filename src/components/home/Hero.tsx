import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-10 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pt-20">
        <div className="fade-in-section">
          <p className="mb-5 text-xs font-semibold uppercase tracking-wide2 text-accent">
            Laptomo Mongolia · Est. 2023
          </p>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tightest text-ink lg:text-7xl">
            Нэг лаптоп, <br />
            <span className="italic text-accent">гурван</span> дэлгэц.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
            Laptomo зөөврийн дэлгэц өргөтгөгч — лаптопоо хормын зуур олон
            дэлгэцтэй ажлын станц болгоно. Нэг USB-C кабелиар plug & play
            холбогдоно, драйвер суулгах шаардлагагүй.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/products">
              <Button size="lg">
                Дэлгүүр үзэх <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/products?category=triple">
              <Button variant="outline" size="lg">
                Гурвалсан дэлгэц
              </Button>
            </Link>
          </div>
          <div className="mt-12 flex gap-10">
            {[
              ["3", "Дэлгэц нэг дор"],
              ["1", "Кабель л хангалттай"],
              ["4.9", "Дундаж үнэлгээ"],
            ].map(([n, l]) => (
              <div key={l}>
                <p className="font-display text-3xl font-bold text-ink">{n}</p>
                <p className="text-xs uppercase tracking-wide2 text-muted">
                  {l}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="fade-in-section relative"
          style={{ animationDelay: "150ms" }}
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl2 bg-surface">
            <Image
              src="https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1100&q=80"
              alt="Laptomo зөөврийн гурвалсан дэлгэц"
              fill
              priority
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 rounded-xl2 border border-line bg-bg/90 p-5 backdrop-blur lg:-left-10">
            <p className="font-display text-2xl font-bold text-ink">
              Laptomo S6 Triple
            </p>
            <p className="text-sm text-accent">1,150,000₮ -с эхэлнэ</p>
          </div>
        </div>
      </div>
    </section>
  );
}
