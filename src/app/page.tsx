import { getProducts } from "@/lib/data";
import { HomeHero } from "@/components/home/HomeHero";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { ProductSection } from "@/components/home/ProductSection";
import { CustomerReviews } from "@/components/home/CustomerReviews";
import { Newsletter } from "@/components/home/Newsletter";
import { SectionHeader } from "@/components/home/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";

export const revalidate = 60;

const FEATURES = [
  { title: "Захиалгаар ирнэ", description: "7-14 хоногт" },
  { title: "12 сар баталгаа", description: "Албан ёсны" },
  { title: "14 хоног буцаалт", description: "Асуудалгүй" },
  { title: "Найдвартай төлбөр", description: "Wire · QPay · Банкны апп" },
];

const STEPS = [
  {
    number: "01",
    title: "Сонгох",
    description: "Хэрэгцээндээ тохирох лаптоп, монитор эсвэл хэрэгслээ сонгоно.",
  },
  {
    number: "02",
    title: "Захиалах",
    description: "Сагсандаа нэмээд Wire, QPay эсвэл бэлэн төлбөрөөр баталгаажуулна.",
  },
  {
    number: "03",
    title: "Хүлээн авах",
    description: "Улаанбаатар хотод хүргэлтээр, баталгаатайгаар хүлээн авна.",
  },
];

export default async function HomePage() {
  const products = await getProducts();
  const featured = products.filter((p) => p.is_featured);
  const newArrivals = products.filter((p) => p.is_new);
  const bestsellers = products.filter((p) => p.is_bestseller);
  const heroProducts = products.filter(
    (p) => p.images[0] && (p.is_featured || p.is_new || p.is_bestseller),
  );

  return (
    <div className="page-enter">
      <HomeHero products={heroProducts} />

      <Reveal>
        <CategoryShowcase />
      </Reveal>

      <Reveal>
        <ProductSection
          eyebrow="Онцлох"
          title="Онцолсон бүтээгдэхүүн"
          products={featured}
          href="/products"
        />
      </Reveal>
      <Reveal>
        <ProductSection
          eyebrow="Шинэ"
          title="Шинээр ирсэн"
          products={newArrivals}
          href="/products?sort=newest"
        />
      </Reveal>
      <Reveal>
        <ProductSection
          eyebrow="Эрэлттэй"
          title="Хамгийн их зарагдсан"
          products={bestsellers}
          href="/products?sort=popular"
        />
      </Reveal>

      <Reveal>
        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <SectionHeader eyebrow="Заавар" title="Хэрхэн ажилладаг вэ" />
          <div className="grid gap-5 md:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="rounded-xl2 border border-line bg-surface p-6"
              >
                <span className="font-display text-3xl font-bold text-accent">
                  {step.number}
                </span>
                <h3 className="mt-4 font-display text-xl font-bold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto grid max-w-7xl gap-4 px-5 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl2 border border-line bg-surface px-5 py-4"
            >
              <p className="font-medium text-ink">{feature.title}</p>
              <p className="mt-1 text-sm text-muted">{feature.description}</p>
            </div>
          ))}
        </section>
      </Reveal>

      <Reveal>
        <CustomerReviews />
      </Reveal>
      <Reveal>
        <Newsletter />
      </Reveal>
    </div>
  );
}
