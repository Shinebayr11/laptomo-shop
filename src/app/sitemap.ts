import { MetadataRoute } from "next";
import { SITE } from "@/constants/site";
import { getProducts, getCategories } from "@/lib/data";

/**
 * Бараа DB-ээс уншигддаг тул sitemap автоматаар шинэчлэгдэнэ — админ самбараас
 * шинэ бараа нэмэхэд гараар засах шаардлагагүй. Цагт нэг удаа дахин үүсгэнэ.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // respectArchiveCookie: false — cookie-гүй client ашиглана. Sitemap нь
  // тодорхой хэрэглэгчийнх биш тул хувийн archive override хамаарахгүй.
  const [products, categories] = await Promise.all([
    getProducts({ respectArchiveCookie: false }),
    getCategories(),
  ]);
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE.url,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE.url}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE.url}/products?category=${category.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE.url}/products/${product.slug}`,
    lastModified: product.created_at ? new Date(product.created_at) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
