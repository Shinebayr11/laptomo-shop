import { MetadataRoute } from "next";
import { SITE } from "@/constants/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Хувийн болон техникийн хуудсууд хайлтад гарах ёсгүй.
      disallow: [
        "/admin",
        "/account",
        "/cart",
        "/checkout",
        "/wishlist",
        "/api/",
        "/auth/",
      ],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
