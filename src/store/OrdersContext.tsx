"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Order, OrderItem, OrderStatus } from "@/types";
import { SEED_ORDERS } from "@/data/orders";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { isSupabaseEnabled } from "@/lib/supabase/client";
import {
  fetchOrders,
  insertOrder,
  updateOrderStatusDb,
} from "@/lib/admin-data";

export interface PlaceOrderInput {
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
  placeOrder: (input: PlaceOrderInput) => Promise<Order>;
  setOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  ordersForUser: (userId: string) => Order[];
}

const Ctx = createContext<OrdersCtx | null>(null);
const supa = isSupabaseEnabled;

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [lsOrders, setLsOrders, lsReady] = useLocalStorage<Order[]>(
    "laptomo_orders",
    SEED_ORDERS,
  );
  const [dbOrders, setDbOrders] = useState<Order[] | null>(null);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    if (!supa) return;
    fetchOrders()
      .then((o) => setDbOrders(o ?? []))
      .catch(() => setDbOrders([]))
      .finally(() => setDbReady(true));
  }, []);

  const orders = supa ? (dbOrders ?? []) : lsOrders;
  const ready = supa ? dbReady : lsReady;

  const placeOrder = async (input: PlaceOrderInput) => {
    const order: Order = {
      ...input,
      id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
      status: "pending",
      created_at: new Date().toISOString(),
    };
    if (supa) {
      await insertOrder(order);
      setDbOrders((prev) => [order, ...(prev ?? [])]);
    } else {
      setLsOrders((prev) => [order, ...prev]);
    }
    return order;
  };

  const setOrderStatus = async (id: string, status: OrderStatus) => {
    if (supa) {
      await updateOrderStatusDb(id, status);
      setDbOrders((prev) =>
        (prev ?? []).map((o) => (o.id === id ? { ...o, status } : o)),
      );
    } else {
      setLsOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o)),
      );
    }
  };

  const ordersForUser = (userId: string) =>
    orders
      .filter((o) => o.user_id === userId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <Ctx.Provider
      value={{ orders, ready, placeOrder, setOrderStatus, ordersForUser }}
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
