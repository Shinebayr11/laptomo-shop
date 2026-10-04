"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Product, Order, Review, OrderStatus, CategoryRow } from "@/types";
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
  categories: CategoryRow[];
  archivedCategories: CategoryRow[];
  ready: boolean;
  saveProduct: (p: Product) => Promise<boolean>;
  archiveProduct: (id: string) => Promise<void>;
  archiveProducts: (ids: string[]) => Promise<void>;
  restoreProduct: (id: string) => Promise<void>;
  setOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  saveCategory: (c: CategoryRow) => Promise<boolean>;
  archiveCategories: (ids: string[]) => Promise<void>;
  restoreCategories: (ids: string[]) => Promise<void>;
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

  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [dbReviews, setDbReviews] = useState<Review[]>([]);
  const [dbCategories, setDbCategories] = useState<CategoryRow[]>([]);
  const [dbReady, setDbReady] = useState(!supa);
  const [actionError, setActionError] = useState<string | null>(
    supa ? null : "Supabase холболт тохируулаагүй байна.",
  );

  useEffect(() => {
    if (!supa) return;
    Promise.allSettled([
      db.fetchProducts(),
      db.fetchReviews(),
      db.fetchCategories(),
    ])
      .then(([productsResult, reviewsResult, categoriesResult]) => {
        if (productsResult.status === "fulfilled") {
          setDbProducts(productsResult.value ?? []);
        }
        if (reviewsResult.status === "fulfilled") {
          setDbReviews(reviewsResult.value ?? []);
        }
        if (categoriesResult.status === "fulfilled") {
          setDbCategories(categoriesResult.value ?? []);
        }

        const failed = [productsResult, reviewsResult, categoriesResult].filter(
          (result) => result.status === "rejected",
        );
        if (failed.length) {
          setActionError(
            "Admin өгөгдлийн зарим хэсгийг ачаалж чадсангүй. Түр хүлээгээд хуудсаа дахин ачаална уу.",
          );
        }
      })
      .finally(() => setDbReady(true));
  }, []);

  const products = dbProducts.filter((product) => !product.is_archived);
  const archivedProducts = archivedOnly(dbProducts);
  const reviews = dbReviews;
  const categories = dbCategories.filter((category) => !category.is_archived);
  const archivedCategories = dbCategories.filter(
    (category) => category.is_archived,
  );
  const ready = dbReady && ordersReady;

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
    if (!supa) return false;
    try {
      await db.upsertProduct(p);
      setDbProducts((prev) =>
        prev.some((x) => x.id === p.id)
          ? prev.map((x) => (x.id === p.id ? p : x))
          : [p, ...prev],
      );
      setActionError(null);
      return true;
    } catch (error) {
      setActionError(
        failureMessage(error, "Бүтээгдэхүүнийг хадгалж чадсангүй."),
      );
      return false;
    }
  };

  /**
   * Архивлах/сэргээх үйлдэл зөвхөн өгөгдлийн санд бичигдэнэ.
   */
  const applyArchived = async (ids: string[], archived: boolean) => {
    if (!ids.length) return;

    if (!supa) return;
    try {
      const affected = await db.setProductsArchivedDb(ids, archived);
      if (affected < ids.length) {
        setActionError(
          "Өөрчлөлт хадгалагдсангүй. Админ эрх байгаа эсэхээ шалгаад дахин оролдоно уу.",
        );
        return;
      }
      setDbProducts((prev) =>
        prev.map((p) =>
          ids.includes(p.id) ? { ...p, is_archived: archived } : p,
        ),
      );
      setActionError(null);
    } catch (error) {
      setActionError(
        failureMessage(error, "Өөрчлөлтийг хадгалж чадсангүй."),
      );
    }
  };

  const archiveProduct = (id: string) => applyArchived([id], true);
  const archiveProducts = (ids: string[]) => applyArchived(ids, true);
  const restoreProduct = (id: string) => applyArchived([id], false);

  const deleteReview = async (id: string) => {
    if (!supa) return;
    try {
      await db.deleteReviewDb(id);
      setDbReviews((prev) => prev.filter((r) => r.id !== id));
      setActionError(null);
    } catch (error) {
      setActionError(
        failureMessage(error, "Сэтгэгдлийг устгаж чадсангүй."),
      );
    }
  };

  const saveCategory = async (c: CategoryRow): Promise<boolean> => {
    if (!supa) return false;
    try {
      await db.upsertCategory(c);
      setDbCategories((prev) =>
        prev.some((x) => x.id === c.id)
          ? prev.map((x) => (x.id === c.id ? c : x))
          : [...prev, c],
      );
      setActionError(null);
      return true;
    } catch (error) {
      setActionError(failureMessage(error, "Ангиллыг хадгалж чадсангүй."));
      return false;
    }
  };

  const setCategoriesArchived = async (
    ids: string[],
    archived: boolean,
  ): Promise<void> => {
    if (!supa || !ids.length) return;
    try {
      const affected = await db.setCategoriesArchivedDb(ids, archived);
      if (affected < ids.length) {
        setActionError(
          "Ангиллын өөрчлөлт бүрэн хадгалагдсангүй. Админ эрхээ шалгаад дахин оролдоно уу.",
        );
        return;
      }
      setDbCategories((prev) =>
        prev.map((category) =>
          ids.includes(category.id)
            ? { ...category, is_archived: archived }
            : category,
        ),
      );
      setActionError(null);
    } catch (error) {
      setActionError(
        failureMessage(
          error,
          archived
            ? "Ангиллыг архивлаж чадсангүй."
            : "Ангиллыг сэргээж чадсангүй.",
        ),
      );
    }
  };

  const archiveCategories = (ids: string[]) =>
    setCategoriesArchived(ids, true);
  const restoreCategories = (ids: string[]) =>
    setCategoriesArchived(ids, false);

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
        categories,
        archivedCategories,
        ready,
        saveProduct,
        archiveProduct,
        archiveProducts,
        restoreProduct,
        setOrderStatus,
        refreshOrders,
        refreshProducts,
        deleteReview,
        saveCategory,
        archiveCategories,
        restoreCategories,
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
