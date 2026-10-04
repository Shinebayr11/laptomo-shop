"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Order, OrderItem, OrderStatus } from "@/types";
import { createClient, isSupabaseEnabled } from "@/lib/supabase/client";
import {
  fetchOrders,
  placeOrderDb,
  updateOrderStatusDb,
} from "@/lib/admin-data";

export interface PlaceOrderInput {
  order_id?: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  items: OrderItem[];
  total_price: number;
}

interface OrdersCtx {
  orders: Order[];
  ready: boolean;
  error: string | null;
  placeOrder: (input: PlaceOrderInput) => Promise<Order>;
  setOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  ordersForUser: (userId: string) => Order[];
  refreshOrders: () => Promise<void>;
}

const Ctx = createContext<OrdersCtx | null>(null);
const supa = isSupabaseEnabled;

function createOrderId() {
  return `ORD-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomUUID()
    .slice(0, 12)
    .toUpperCase()}`;
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [dbOrders, setDbOrders] = useState<Order[]>([]);
  const [dbReady, setDbReady] = useState(!supa);
  const [error, setError] = useState<string | null>(
    supa ? null : "Supabase холболт тохируулаагүй байна.",
  );

  const refreshOrders = useCallback(async () => {
    if (!supa) return;
    try {
      const next = await fetchOrders();
      setDbOrders(next ?? []);
      setError(null);
    } catch (loadError) {
      setDbOrders([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Захиалгын мэдээлэл татаж чадсангүй.",
      );
    } finally {
      setDbReady(true);
    }
  }, []);

  useEffect(() => {
    if (!supa) return;
    const sb = createClient();
    let active = true;

    const load = async () => {
      if (!active) return;
      await refreshOrders();
    };

    void load();
    const {
      data: { subscription },
    } = sb!.auth.onAuthStateChange(() => {
      window.setTimeout(() => {
        void load();
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [refreshOrders]);

  const orders = dbOrders;
  const ready = dbReady;

  const placeOrder = async (input: PlaceOrderInput) => {
    const { order_id, ...orderInput } = input;
    if (order_id) {
      const existing = orders.find((order) => order.id === order_id);
      if (existing) return existing;
    }

    const order: Order = {
      ...orderInput,
      id: order_id ?? createOrderId(),
      status: "pending",
      created_at: new Date().toISOString(),
    };
    if (!supa) {
      throw new Error("Захиалга өгөхийн тулд Supabase холболт шаардлагатай.");
    }
    try {
      // Нөөц хасалттай хамт бичигдэнэ. Буцаж ирсэн мөрийг ашиглана —
      // ижил дугаартай захиалга аль хэдийн байвал түүнийг буцаадаг.
      const saved = await placeOrderDb(order);
      setDbOrders((prev) =>
        prev.some((o) => o.id === saved.id)
          ? prev.map((o) => (o.id === saved.id ? saved : o))
          : [saved, ...prev],
      );
      setError(null);
      return saved;
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Захиалгыг хадгалж чадсангүй.";
      setError(message);
      throw new Error(message);
    }
  };

  const setOrderStatus = async (id: string, status: OrderStatus) => {
    if (!supa) {
      throw new Error("Захиалгын төлөв өөрчлөхөд Supabase шаардлагатай.");
    }
    try {
      await updateOrderStatusDb(id, status);
      setDbOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o)),
      );
      setError(null);
    } catch (updateError) {
      const message =
        updateError instanceof Error
          ? updateError.message
          : "Захиалгын төлөв шинэчилж чадсангүй.";
      setError(message);
      throw new Error(message);
    }
  };

  const ordersForUser = (userId: string) =>
    orders
      .filter((o) => o.user_id === userId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <Ctx.Provider
      value={{
        orders,
        ready,
        error,
        placeOrder,
        setOrderStatus,
        ordersForUser,
        refreshOrders,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useOrders нь OrdersProvider дотор ашиглагдана");
  return ctx;
}
