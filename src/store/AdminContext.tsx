"use client";
import { createContext, useContext, ReactNode } from "react";
import { Product, Order, Review, OrderStatus } from "@/types";
import { SEED_PRODUCTS } from "@/data/products";
import { SEED_ORDERS } from "@/data/orders";
import { SEED_REVIEWS } from "@/data/reviews";
import { useLocalStorage } from "@/hooks/useLocalStorage";

/**
 * Админ дата давхарга. Supabase тохируулаагүй үед өөрчлөлтийг
 * localStorage дээр хадгалж, demo горимд бүрэн ажиллана.
 * Supabase идэвхтэй бол энд бичих логикийг өргөтгөж болно.
 */
interface AdminCtx {
  products: Product[];
  orders: Order[];
  reviews: Review[];
  ready: boolean;
  saveProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  deleteReview: (id: string) => void;
}

const Ctx = createContext<AdminCtx | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [products, setProducts, r1] = useLocalStorage<Product[]>("laptomo_admin_products", SEED_PRODUCTS);
  const [orders, setOrders, r2] = useLocalStorage<Order[]>("laptomo_admin_orders", SEED_ORDERS);
  const [reviews, setReviews, r3] = useLocalStorage<Review[]>("laptomo_admin_reviews", SEED_REVIEWS);

  const saveProduct = (p: Product) =>
    setProducts((prev) => {
      const exists = prev.some((x) => x.id === p.id);
      return exists ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev];
    });

  const deleteProduct = (id: string) => setProducts((prev) => prev.filter((p) => p.id !== id));

  const setOrderStatus = (id: string, status: OrderStatus) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

  const deleteReview = (id: string) => setReviews((prev) => prev.filter((r) => r.id !== id));

  return (
    <Ctx.Provider
      value={{ products, orders, reviews, ready: r1 && r2 && r3, saveProduct, deleteProduct, setOrderStatus, deleteReview }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdmin нь AdminProvider дотор ашиглагдана");
  return ctx;
}
