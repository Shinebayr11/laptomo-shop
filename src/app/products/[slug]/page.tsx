import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getProductBySlug, getProducts, getRelatedProducts, getReviews } from "@/lib/data";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { ProductReviews } from "@/components/product/ProductReviews";
import { RelatedProducts } from "@/components/product/RelatedProducts";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Олдсонгүй" };
  return { title: product.title, description: product.description.slice(0, 150) };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    getRelatedProducts(product),
    getReviews(product.id),
  ]);

  return (
    <div className="page-enter mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <nav className="mb-8 flex items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="hover:text-accent">Нүүр</Link><ChevronRight size={13} />
        <Link href="/products" className="hover:text-accent">Бүтээгдэхүүн</Link><ChevronRight size={13} />
        <span className="text-ink">{product.title}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <ProductGallery images={product.images} title={product.title} />
        <div>
          <ProductInfo product={product} />
          <ProductSpecs specs={product.specifications} />
        </div>
      </div>

      <ProductReviews productId={product.id} initial={reviews} />
      <RelatedProducts products={related} />
    </div>
  );
}
