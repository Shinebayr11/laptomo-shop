import { Product, Review, Order } from "@/types";
import { SEED_PRODUCTS } from "@/data/products";
import { SEED_REVIEWS } from "@/data/reviews";
import { SEED_ORDERS } from "@/data/orders";
import {
  applyArchiveOverrides,
  visibleProducts,
} from "./archive-overrides";
import { getArchiveOverridesFromCookie } from "./archive-overrides-server";
import {
  createServerSupabase,
  createStaticSupabase,
  isSupabaseEnabled,
} from "./supabase/server";

type GetProductsOptions = {
  respectArchiveCookie?: boolean;
};

function publicVisibleProducts(
  products: Product[],
  options: GetProductsOptions,
): Product[] {
  const respectArchiveCookie = options.respectArchiveCookie ?? true;

  if (!respectArchiveCookie) return visibleProducts(products);

  return visibleProducts(
    applyArchiveOverrides(products, getArchiveOverridesFromCookie()),
  );
}

export async function getProducts(
  options: GetProductsOptions = {},
): Promise<Product[]> {
  if (!isSupabaseEnabled) return publicVisibleProducts(SEED_PRODUCTS, options);
  try {
    // Archive cookie хэрэггүй үед cookie-гүй client ашиглана — ингэснээр
    // request context байхгүй build үед ч DB-ээс жинхэнэ дата уншина.
    const sb =
      options.respectArchiveCookie === false
        ? createStaticSupabase()
        : createServerSupabase();
    const { data, error } = await sb!.from("products").select("*").order("created_at", { ascending: false });
    // Зөвхөн ХОЛБОЛТ амжилтгүй үед seed рүү шилжинэ. Хоосон каталогийг
    // seed-ээр дүүргэвэл админы устгасан бараа дэлгүүрт эргэж гарна.
    if (error) return publicVisibleProducts(SEED_PRODUCTS, options);

    // DB бол цорын ганц эх сурвалж. Өмнө нь SEED_PRODUCTS-тэй нийлүүлдэг
    // байсан тул DB-ээс бараа устгахад кодын seed хувилбар нь орлож,
    // устгасан бараа дэлгүүрт эргэж гарч ирдэг байв.
    return publicVisibleProducts((data ?? []) as Product[], options);
  } catch {
    return publicVisibleProducts(SEED_PRODUCTS, options);
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug || p.id === slug) ?? null;
}

export async function getReviews(productId?: string): Promise<Review[]> {
  let list = SEED_REVIEWS;
  if (isSupabaseEnabled) {
    try {
      const sb = createServerSupabase();
      const { data } = await sb!.from("reviews").select("*").order("created_at", { ascending: false });
      if (data?.length) list = data as Review[];
    } catch {
      /* seed руу шилжинэ */
    }
  }
  return productId ? list.filter((r) => r.product_id === productId) : list;
}

export async function getOrders(): Promise<Order[]> {
  if (!isSupabaseEnabled) return SEED_ORDERS;
  try {
    const sb = createServerSupabase();
    const { data } = await sb!.from("orders").select("*").order("created_at", { ascending: false });
    return (data as Order[]) ?? SEED_ORDERS;
  } catch {
    return SEED_ORDERS;
  }
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const products = await getProducts();
  return products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}
