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
import {
  ARCHIVE_OVERRIDES_STORAGE_KEY,
  ArchiveOverrides,
  applyArchiveOverrides,
  visibleProducts,
  writeArchiveOverridesCookie,
} from "@/lib/archive-overrides";
import { isSupabaseEnabled } from "@/lib/supabase/client";
import * as db from "@/lib/admin-data";
import { useOrders } from "./OrdersContext";

interface AdminCtx {
  products: Product[];
  archivedProducts: Product[];
  orders: Order[];
  ordersError: string | null;
  reviews: Review[];
  ready: boolean;
  saveProduct: (p: Product) => Promise<void>;
  archiveProduct: (id: string) => Promise<void>;
  archiveProducts: (ids: string[]) => Promise<void>;
  restoreProduct: (id: string) => Promise<void>;
  setOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  refreshOrders: () => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
}

const Ctx = createContext<AdminCtx | null>(null);
const supa = isSupabaseEnabled;
const archivedOnly = (products: Product[]) =>
  products.filter((product) => product.is_archived);

export function AdminProvider({ children }: { children: ReactNode }) {
  const {
    orders,
    ready: ordersReady,
    error: ordersError,
    setOrderStatus,
    refreshOrders,
  } = useOrders();

  const [lsProducts, setLsProducts, r1] = useLocalStorage<Product[]>(
    "laptomo_admin_products",
    SEED_PRODUCTS,
  );
  const [lsReviews, setLsReviews, r3] = useLocalStorage<Review[]>(
    "laptomo_admin_reviews",
    SEED_REVIEWS,
  );
  const [archiveOverrides, setArchiveOverrides, r4] =
    useLocalStorage<ArchiveOverrides>(ARCHIVE_OVERRIDES_STORAGE_KEY, {});
  const [dbProducts, setDbProducts] = useState<Product[] | null>(null);
  const [dbReviews, setDbReviews] = useState<Review[] | null>(null);
  const [dbReady, setDbReady] = useState(false);
  const [dbAvailable, setDbAvailable] = useState(supa);

  useEffect(() => {
    if (!supa) return;
    Promise.all([db.fetchProducts(), db.fetchReviews()])
      .then(([p, r]) => {
        setDbProducts(p ?? []);
        setDbReviews(r ?? []);
      })
      .catch(() => {
        setDbAvailable(false);
        setDbProducts(null);
        setDbReviews(null);
      })
      .finally(() => setDbReady(true));
  }, []);

  useEffect(() => {
    if (!r1 || !r4) return;
    const archivedIds = lsProducts
      .filter((product) => product.is_archived)
      .map((product) => product.id);

    if (!archivedIds.length) return;

    setArchiveOverrides((prev) => {
      let changed = false;
      const next = { ...prev };

      for (const id of archivedIds) {
        if (!(id in next)) {
          next[id] = true;
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [lsProducts, r1, r4, setArchiveOverrides]);

  useEffect(() => {
    if (!r4) return;
    writeArchiveOverridesCookie(archiveOverrides);
  }, [archiveOverrides, r4]);

  const useDb = supa && dbAvailable;
  const allProducts = applyArchiveOverrides(
    useDb ? (dbProducts ?? []) : lsProducts,
    archiveOverrides,
  );
  const products = visibleProducts(allProducts);
  const archivedProducts = archivedOnly(allProducts);
  const reviews = useDb ? (dbReviews ?? []) : lsReviews;
  const ready = (useDb ? dbReady : r1 && r3) && r4 && ordersReady;

  const setArchiveOverride = (id: string, archived: boolean) => {
    setArchiveOverrides((prev) => ({ ...prev, [id]: archived }));
  };
  const setArchiveOverridesForIds = (ids: string[], archived: boolean) => {
    setArchiveOverrides((prev) => {
      const next = { ...prev };
      for (const id of ids) next[id] = archived;
      return next;
    });
  };

  const saveProduct = async (p: Product) => {
    if (useDb) {
      try {
        await db.upsertProduct(p);
        setDbProducts((prev) => {
          const list = prev ?? [];
          return list.some((x) => x.id === p.id)
            ? list.map((x) => (x.id === p.id ? p : x))
            : [p, ...list];
        });
        return;
      } catch {
        setDbAvailable(false);
      }
    }

    setLsProducts((prev) =>
      prev.some((x) => x.id === p.id)
        ? prev.map((x) => (x.id === p.id ? p : x))
        : [p, ...prev],
    );
  };

  const archiveProduct = async (id: string) => {
    setArchiveOverride(id, true);

    if (useDb) {
      try {
        await db.archiveProductDb(id);
        setDbProducts((prev) =>
          (prev ?? []).map((p) =>
            p.id === id ? { ...p, is_archived: true } : p,
          ),
        );
        return;
      } catch {
        setDbAvailable(false);
      }
    }

    setLsProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_archived: true } : p)),
    );
  };

  const archiveProducts = async (ids: string[]) => {
    if (!ids.length) return;
    setArchiveOverridesForIds(ids, true);

    if (useDb) {
      try {
        await db.archiveProductsDb(ids);
        setDbProducts((prev) =>
          (prev ?? []).map((p) =>
            ids.includes(p.id) ? { ...p, is_archived: true } : p,
          ),
        );
        return;
      } catch {
        setDbAvailable(false);
      }
    }

    setLsProducts((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, is_archived: true } : p)),
    );
  };

  const restoreProduct = async (id: string) => {
    setArchiveOverride(id, false);

    if (useDb) {
      try {
        await db.restoreProductDb(id);
        setDbProducts((prev) =>
          (prev ?? []).map((p) =>
            p.id === id ? { ...p, is_archived: false } : p,
          ),
        );
        return;
      } catch {
        setDbAvailable(false);
      }
    }

    setLsProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_archived: false } : p)),
    );
  };

  const deleteReview = async (id: string) => {
    if (useDb) {
      try {
        await db.deleteReviewDb(id);
        setDbReviews((prev) => (prev ?? []).filter((r) => r.id !== id));
        return;
      } catch {
        setDbAvailable(false);
      }
    }

    setLsReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <Ctx.Provider
      value={{
        products,
        archivedProducts,
        orders,
        ordersError,
        reviews,
        ready,
        saveProduct,
        archiveProduct,
        archiveProducts,
        restoreProduct,
        setOrderStatus,
        refreshOrders,
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
