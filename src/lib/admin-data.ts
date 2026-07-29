import { createClient, isSupabaseEnabled } from "@/lib/supabase/client";
import { Product, Order, Review, OrderStatus } from "@/types";

/**
 * RLS-д хаагдсан бичилт нь алдаа буцаадаггүй, зүгээр 0 мөр өөрчилдөг.
 * Тиймээс өөрчлөгдсөн мөрийн тоог заавал шалгаж, дуугүй бүтэлгүйтэхээс сэргийлнэ.
 */
function assertWritten(rows: { id: string }[] | null, expected: number) {
  if ((rows?.length ?? 0) < expected) {
    throw new Error(
      "Өөрчлөлт хадгалагдсангүй. Админ эрх байгаа эсэхээ шалгаад дахин оролдоно уу.",
    );
  }
}

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
  const { data, error } = await sb!.from("products").upsert(p).select("id");
  if (error) throw error;
  assertWritten(data, 1);
}

/**
 * Архивлах/сэргээх үйлдлүүд DB-д байхгүй seed бараанд ч дуудагдаж болох тул
 * алдаа шидэхийн оронд бодитоор өөрчлөгдсөн мөрийн тоог буцаана.
 * Дуудагч тал нь энэ тоог хүлээгдэж буй тоотой харьцуулж шийднэ.
 */
export async function setProductsArchivedDb(
  ids: string[],
  archived: boolean,
): Promise<number> {
  if (!ids.length) return 0;
  const sb = createClient();
  const { data, error } = await sb!
    .from("products")
    .update({ is_archived: archived })
    .in("id", ids)
    .select("id");
  if (error) throw error;
  return data?.length ?? 0;
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
  const { data, error } = await sb!
    .from("reviews")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw error;
  assertWritten(data, 1);
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

/** Migration ажиллуулаагүй бол ойлгомжтой мессеж өгнө. */
function missingFunctionError(error: { code?: string; message?: string }) {
  const message = error.message ?? "";
  return (
    error.code === "PGRST202" ||
    message.includes("Could not find the function") ||
    message.includes("does not exist")
  );
}

/**
 * Захиалгыг үүсгэнэ. Нөөц хасалт болон захиалга бичих хоёр нэг transaction
 * дотор явагдана — supabase/stock-tracking.sql доторх place_order function.
 */
export async function placeOrderDb(order: Order): Promise<Order> {
  const sb = createClient();
  const { data, error } = await sb!.rpc("place_order", {
    p_order_id: order.id,
    p_customer_name: order.customer_name,
    p_customer_phone: order.customer_phone,
    p_address: order.address,
    p_items: order.items,
    p_total_price: order.total_price,
  });

  if (error) {
    if (missingFunctionError(error)) {
      throw new Error(
        "Нөөцийн хяналтын SQL ажиллаагүй байна. Supabase SQL Editor дээр supabase/stock-tracking.sql-ийг нэг удаа ажиллуулна уу.",
      );
    }
    throw new Error(error.message);
  }

  const saved = data as Order;
  // PostgREST numeric төрлийг string болгож буцаах тохиолдол байдаг.
  return { ...saved, total_price: Number(saved.total_price) };
}

/**
 * Захиалгын төлөв солино. Цуцлахад нөөц буцаж нэмэгдэх, цуцлагдсанаас
 * сэргээхэд дахин хасагдах логик SQL талд байна.
 */
export async function updateOrderStatusDb(
  id: string,
  status: OrderStatus,
): Promise<void> {
  const sb = createClient();
  const { error } = await sb!.rpc("set_order_status", {
    p_order_id: id,
    p_status: status,
  });

  if (error) {
    if (missingFunctionError(error)) {
      throw new Error(
        "Нөөцийн хяналтын SQL ажиллаагүй байна. Supabase SQL Editor дээр supabase/stock-tracking.sql-ийг нэг удаа ажиллуулна уу.",
      );
    }
    throw new Error(error.message);
  }
}
