"use client";
import {
  createContext,
  useCallback,
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
import { mergeWithSeedProducts } from "@/lib/product-catalog";
import { isSupabaseEnabled } from "@/lib/supabase/client";
import * as db from "@/lib/admin-data";
import { useOrders } from "./OrdersContext";

interface AdminCtx {
  products: Product[];
  archivedProducts: Product[];
  orders: Order[];
  ordersError: string | null;
  actionError: string | null;
  clearActionError: () => void;
  reviews: Review[];
  ready: boolean;
  saveProduct: (p: Product) => Promise<boolean>;
  archiveProduct: (id: string) => Promise<void>;
  archiveProducts: (ids: string[]) => Promise<void>;
  restoreProduct: (id: string) => Promise<void>;
  setOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshProducts: () => Promise<void>;
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
    setOrderStatus: setOrderStatusDb,
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
  const [actionError, setActionError] = useState<string | null>(null);

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
    mergeWithSeedProducts(useDb ? (dbProducts ?? []) : lsProducts),
    archiveOverrides,
  );
  const products = visibleProducts(allProducts);
  const archivedProducts = archivedOnly(allProducts);
  const reviews = useDb ? (dbReviews ?? []) : lsReviews;
  const ready = (useDb ? dbReady : r1 && r3) && r4 && ordersReady;

  const setArchiveOverridesForIds = (ids: string[], archived: boolean) => {
    setArchiveOverrides((prev) => {
      const next = { ...prev };
      for (const id of ids) next[id] = archived;
      return next;
    });
  };

  const failureMessage = (error: unknown, fallback: string) =>
    error instanceof Error && error.message ? error.message : fallback;

  /** Захиалга үүсэх / цуцлагдахад нөөц өөрчлөгддөг тул DB-ээс дахин уншина. */
  const refreshProducts = useCallback(async () => {
    if (!supa) return;
    try {
      const next = await db.fetchProducts();
      setDbProducts(next ?? []);
    } catch {
      /* нөөцийн шинэчлэл амжилтгүй бол хуучин утга үлдэнэ */
    }
  }, []);

  /** Төлөв солиход нөөц буцаж нэмэгддэг тул барааны жагсаалтыг синк хийнэ. */
  const setOrderStatus = async (id: string, status: OrderStatus) => {
    await setOrderStatusDb(id, status);
    await refreshProducts();
  };

  const saveProduct = async (p: Product): Promise<boolean> => {
    if (useDb) {
      try {
        await db.upsertProduct(p);
        setDbProducts((prev) => {
          const list = prev ?? [];
          return list.some((x) => x.id === p.id)
            ? list.map((x) => (x.id === p.id ? p : x))
            : [p, ...list];
        });
        setActionError(null);
        return true;
      } catch (error) {
        setActionError(
          failureMessage(error, "Бүтээгдэхүүнийг хадгалж чадсангүй."),
        );
        return false;
      }
    }

    setLsProducts((prev) =>
      prev.some((x) => x.id === p.id)
        ? prev.map((x) => (x.id === p.id ? p : x))
        : [p, ...prev],
    );
    return true;
  };

  /**
   * Архивлах/сэргээх. DB-д байгаа барааг DB дээр, зөвхөн seed дотор байгаа
   * барааг override-оор зохицуулна. DB бичилт бүтэлгүйтвэл UI-д "амжилттай"
   * гэж харагдахгүй — алдаа буцаана.
   */
  const applyArchived = async (ids: string[], archived: boolean) => {
    if (!ids.length) return;

    if (useDb) {
      const dbIds = ids.filter((id) =>
        (dbProducts ?? []).some((p) => p.id === id),
      );

      if (dbIds.length) {
        try {
          const affected = await db.setProductsArchivedDb(dbIds, archived);
          if (affected < dbIds.length) {
            setActionError(
              "Өөрчлөлт хадгалагдсангүй. Админ эрх байгаа эсэхээ шалгаад дахин оролдоно уу.",
            );
            return;
          }
          setDbProducts((prev) =>
            (prev ?? []).map((p) =>
              dbIds.includes(p.id) ? { ...p, is_archived: archived } : p,
            ),
          );
        } catch (error) {
          setActionError(
            failureMessage(error, "Өөрчлөлтийг хадгалж чадсангүй."),
          );
          return;
        }
      }

      setActionError(null);
      setArchiveOverridesForIds(ids, archived);
      return;
    }

    setArchiveOverridesForIds(ids, archived);
    setLsProducts((prev) =>
      prev.map((p) =>
        ids.includes(p.id) ? { ...p, is_archived: archived } : p,
      ),
    );
  };

  const archiveProduct = (id: string) => applyArchived([id], true);
  const archiveProducts = (ids: string[]) => applyArchived(ids, true);
  const restoreProduct = (id: string) => applyArchived([id], false);

  const deleteReview = async (id: string) => {
    if (useDb) {
      try {
        await db.deleteReviewDb(id);
        setDbReviews((prev) => (prev ?? []).filter((r) => r.id !== id));
        setActionError(null);
      } catch (error) {
        setActionError(
          failureMessage(error, "Сэтгэгдлийг устгаж чадсангүй."),
        );
      }
      return;
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
        actionError,
        clearActionError: () => setActionError(null),
        reviews,
        ready,
        saveProduct,
        archiveProduct,
        archiveProducts,
        restoreProduct,
        setOrderStatus,
        refreshOrders,
        refreshProducts,
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
