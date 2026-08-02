import { MetadataRoute } from "next";
import { SITE } from "@/constants/site";
import { CATEGORIES } from "@/constants/categories";
import { getProducts } from "@/lib/data";

/**
 * Бараа DB-ээс уншигддаг тул sitemap автоматаар шинэчлэгдэнэ — админ самбараас
 * шинэ бараа нэмэхэд гараар засах шаардлагагүй. Цагт нэг удаа дахин үүсгэнэ.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // respectArchiveCookie: false — cookie-гүй client ашиглана. Sitemap нь
  // тодорхой хэрэглэгчийнх биш тул хувийн archive override хамаарахгүй.
  const products = await getProducts({ respectArchiveCookie: false });
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

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
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
