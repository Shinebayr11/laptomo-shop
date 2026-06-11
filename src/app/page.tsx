import { getProducts } from "@/lib/data";
import { Hero } from "@/components/home/Hero";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { ProductSection } from "@/components/home/ProductSection";
import { CustomerReviews } from "@/components/home/CustomerReviews";
import { Newsletter } from "@/components/home/Newsletter";

// SSR — бүтээгдэхүүнийг сервер дээр татаж, SEO-д ээлтэй хуудас үзүүлнэ
export const revalidate = 60;

export default async function HomePage() {
  const products = await getProducts();
  const featured = products.filter((p) => p.is_featured);
  const newArrivals = products.filter((p) => p.is_new);
  const bestsellers = products.filter((p) => p.is_bestseller);

  return (
    <div className="page-enter">
      <Hero />
      <CategoryShowcase />
      <ProductSection eyebrow="Онцлох" title="Онцолсон бүтээгдэхүүн" products={featured} href="/products" />
      <ProductSection eyebrow="Шинэ" title="Шинээр ирсэн" products={newArrivals} href="/products?sort=newest" />
      <ProductSection eyebrow="Эрэлттэй" title="Хамгийн их зарагдсан" products={bestsellers} href="/products?sort=popular" />
      <CustomerReviews />
      <Newsletter />
    </div>
  );
}
