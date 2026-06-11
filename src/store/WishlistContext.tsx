"use client";
import { createContext, useContext, ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface WishlistCtx {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  count: number;
  ready: boolean;
}

const Ctx = createContext<WishlistCtx | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds, ready] = useLocalStorage<string[]>("laptomo_wishlist", []);

  const has = (id: string) => ids.includes(id);
  const toggle = (id: string) =>
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <Ctx.Provider value={{ ids, has, toggle, count: ids.length, ready }}>
      {children}
    </Ctx.Provider>
  );
}

export const useWishlist = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useWishlist must be inside WishlistProvider");
  return c;
};
