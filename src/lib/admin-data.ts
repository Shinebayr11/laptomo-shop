import { createClient, isSupabaseEnabled } from "@/lib/supabase/client";
import { Product, Order, Review, OrderStatus } from "@/types";

// ---------- Бүтээгдэхүүн ----------
export async function fetchProducts(): Promise<Product[] | null> {
  if (!isSupabaseEnabled) return null;
  const sb = createClient();
  const { data, error } = await sb!
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Product[]) ?? [];
}

export async function upsertProduct(p: Product): Promise<void> {
  const sb = createClient();
  const { error } = await sb!.from("products").upsert(p);
  if (error) throw error;
}

export async function archiveProductDb(id: string): Promise<void> {
  const sb = createClient();
  const { error } = await sb!
    .from("products")
    .update({ is_archived: true })
    .eq("id", id)
    .select("id");
  if (error) throw error;
}

export async function archiveProductsDb(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const sb = createClient();
  const { error } = await sb!
    .from("products")
    .update({ is_archived: true })
    .in("id", ids)
    .select("id");
  if (error) throw error;
}

export async function restoreProductDb(id: string): Promise<void> {
  const sb = createClient();
  const { error } = await sb!
    .from("products")
    .update({ is_archived: false })
    .eq("id", id)
    .select("id");
  if (error) throw error;
}

// ---------- Сэтгэгдэл ----------
export async function fetchReviews(): Promise<Review[] | null> {
  if (!isSupabaseEnabled) return null;
  const sb = createClient();
  const { data, error } = await sb!
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Review[]) ?? [];
}

export async function deleteReviewDb(id: string): Promise<void> {
  const sb = createClient();
  const { error } = await sb!.from("reviews").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Захиалга ----------
export async function fetchOrders(): Promise<Order[] | null> {
  if (!isSupabaseEnabled) return null;
  const sb = createClient();
  const { data, error } = await sb!
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Order[]) ?? [];
}

export async function insertOrder(order: Order): Promise<void> {
  const sb = createClient();
  const { data: auth } = await sb!.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error("Нэвтрээгүй байна");
  const { error } = await sb!.from("orders").insert({ ...order, user_id: uid });
  if (error) throw error;
}

export async function updateOrderStatusDb(
  id: string,
  status: OrderStatus,
): Promise<void> {
  const sb = createClient();
  const { error } = await sb!.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}
