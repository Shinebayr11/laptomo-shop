import { Category, CategoryRow, Product, Review } from "@/types";
import { nestCategories } from "./categories";
import {
  createStaticSupabase,
  isSupabaseEnabled,
} from "./supabase/server";

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseEnabled) return [];
  const sb = createStaticSupabase();
  const [productsResult, categoriesResult] = await Promise.all([
    sb!
      .from("products")
      .select("*")
      .eq("is_archived", false)
      .order("created_at", { ascending: false }),
    sb!.from("categories").select("*"),
  ]);
  if (productsResult.error) throw new Error(productsResult.error.message);
  if (categoriesResult.error) throw new Error(categoriesResult.error.message);

  const activeCategories = (categoriesResult.data ?? []) as CategoryRow[];
  const activeParentSlugs = new Set(
    activeCategories
      .filter((category) => !category.parent_slug && !category.is_archived)
      .map((category) => category.slug),
  );
  const activeSubcategorySlugs = new Set(
    activeCategories
      .filter((category) => category.parent_slug && !category.is_archived)
      .map((category) => category.slug),
  );

  return ((productsResult.data ?? []) as Product[]).filter(
    (product) =>
      activeParentSlugs.has(product.category) &&
      activeSubcategorySlugs.has(product.subcategory),
  );
}

function normalizeProductKey(value: string): string {
  try {
    return decodeURIComponent(value).normalize("NFC");
  } catch {
    return value.normalize("NFC");
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  const key = normalizeProductKey(slug);
  return (
    products.find(
      (product) =>
        normalizeProductKey(product.slug) === key ||
        normalizeProductKey(product.id) === key,
    ) ?? null
  );
}

export async function getReviews(productId?: string): Promise<Review[]> {
  if (!isSupabaseEnabled) return [];
  const sb = createStaticSupabase();
  let query = sb!
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (productId) query = query.eq("product_id", productId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const list = (data ?? []) as Review[];
  return productId ? list.filter((r) => r.product_id === productId) : list;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const products = await getProducts();
  return products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}

/**
 * Ангилал cookie/session-оос хамаардаггүй тул request context шаардахгүй
 * createStaticSupabase ашиглана — sitemap, generateStaticParams зэрэг build
 * үед ч дуудаж болно.
 */
export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseEnabled) return [];
  const sb = createStaticSupabase();
  const { data, error } = await sb!
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return nestCategories(
    ((data ?? []) as CategoryRow[]).filter((category) => !category.is_archived),
  );
}
