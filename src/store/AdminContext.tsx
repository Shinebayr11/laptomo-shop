"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Product, Order, Review, OrderStatus } from "@/types";
import { SEED_PRODUCTS } from "@/data/products";
import { SEED_REVIEWS } from "@/data/reviews";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { isSupabaseEnabled } from "@/lib/supabase/client";
import * as db from "@/lib/admin-data";
import { useOrders } from "./OrdersContext";

interface AdminCtx {
  products: Product[];
  orders: Order[];
  reviews: Review[];
  ready: boolean;
  saveProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
}

const Ctx = createContext<AdminCtx | null>(null);
const supa = isSupabaseEnabled;

export function AdminProvider({ children }: { children: ReactNode }) {
  const { orders, ready: ordersReady, setOrderStatus } = useOrders();

  const [lsProducts, setLsProducts, r1] = useLocalStorage<Product[]>(
    "laptomo_admin_products",
    SEED_PRODUCTS,
  );
  const [lsReviews, setLsReviews, r3] = useLocalStorage<Review[]>(
    "laptomo_admin_reviews",
    SEED_REVIEWS,
  );
  const [dbProducts, setDbProducts] = useState<Product[] | null>(null);
  const [dbReviews, setDbReviews] = useState<Review[] | null>(null);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    if (!supa) return;
    Promise.all([db.fetchProducts(), db.fetchReviews()])
      .then(([p, r]) => {
        setDbProducts(p ?? []);
        setDbReviews(r ?? []);
      })
      .catch(() => {
        setDbProducts([]);
        setDbReviews([]);
      })
      .finally(() => setDbReady(true));
  }, []);

  const products = supa ? (dbProducts ?? []) : lsProducts;
  const reviews = supa ? (dbReviews ?? []) : lsReviews;
  const ready = (supa ? dbReady : r1 && r3) && ordersReady;

  const saveProduct = async (p: Product) => {
    if (supa) {
      await db.upsertProduct(p);
      setDbProducts((prev) => {
        const list = prev ?? [];
        return list.some((x) => x.id === p.id)
          ? list.map((x) => (x.id === p.id ? p : x))
          : [p, ...list];
      });
    } else {
      setLsProducts((prev) =>
        prev.some((x) => x.id === p.id)
          ? prev.map((x) => (x.id === p.id ? p : x))
          : [p, ...prev],
      );
    }
  };

  const deleteProduct = async (id: string) => {
    if (supa) {
      await db.deleteProductDb(id);
      setDbProducts((prev) => (prev ?? []).filter((p) => p.id !== id));
    } else {
      setLsProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const deleteReview = async (id: string) => {
    if (supa) {
      await db.deleteReviewDb(id);
      setDbReviews((prev) => (prev ?? []).filter((r) => r.id !== id));
    } else {
      setLsReviews((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <Ctx.Provider
      value={{
        products,
        orders,
        reviews,
        ready,
        saveProduct,
        deleteProduct,
        setOrderStatus,
        deleteReview,
      }}
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
