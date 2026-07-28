"use client";
import { createContext, useContext, useEffect, useMemo, ReactNode } from "react";
import { CartLine, Product } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { effectivePrice } from "@/utils/format";

interface CartCtx {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (product: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  ready: boolean;
}

const Ctx = createContext<CartCtx | null>(null);
const EMPTY_CART: CartLine[] = [];

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const cartKey = user
    ? `laptomo_cart_user_${user.id}`
    : "laptomo_cart_guest";
  const [storedLines, setLines, cartReady] = useLocalStorage<CartLine[]>(
    cartKey,
    [],
  );
  const ready = authReady && cartReady;
  const lines = ready ? storedLines : EMPTY_CART;

  useEffect(() => {
    localStorage.removeItem("laptomo_cart");
  }, []);

  const add = (product: Product, qty = 1) =>
    setLines((prev) => {
      const found = prev.find((l) => l.product.id === product.id);
      if (found)
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, quantity: l.quantity + qty } : l
        );
      return [...prev, { product, quantity: qty }];
    });

  const remove = (id: string) =>
    setLines((prev) => prev.filter((l) => l.product.id !== id));

  const setQty = (id: string, qty: number) =>
    setLines((prev) =>
      prev
        .map((l) => (l.product.id === id ? { ...l, quantity: Math.max(1, qty) } : l))
        .filter((l) => l.quantity > 0)
    );

  const clear = () => setLines([]);

  const count = useMemo(() => lines.reduce((s, l) => s + l.quantity, 0), [lines]);
  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + effectivePrice(l.product.price, l.product.discount_price) * l.quantity, 0),
    [lines]
  );

  return (
    <Ctx.Provider value={{ lines, count, subtotal, add, remove, setQty, clear, ready }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be inside CartProvider");
  return c;
};
