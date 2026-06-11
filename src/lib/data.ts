import { Product, Review, Order } from "@/types";
import { SEED_PRODUCTS } from "@/data/products";
import { SEED_REVIEWS } from "@/data/reviews";
import { SEED_ORDERS } from "@/data/orders";
import { createServerSupabase, isSupabaseEnabled } from "./supabase/server";

/**
 * Бүх өгөгдлийн уншилт энэ давхаргаар дамжина.
 * Supabase тохируулсан бол DB-ээс, үгүй бол seed дата буцаана.
 */
export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseEnabled) return SEED_PRODUCTS;
  try {
    const sb = createServerSupabase();
    const { data, error } = await sb!.from("products").select("*").order("created_at", { ascending: false });
    if (error || !data?.length) return SEED_PRODUCTS;
    return data as Product[];
  } catch {
    return SEED_PRODUCTS;
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
