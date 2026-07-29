"use client";
import { createContext, useContext, useEffect, ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { migrateLegacyKey } from "@/lib/legacy-storage";

interface WishlistCtx {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  count: number;
  ready: boolean;
}

const Ctx = createContext<WishlistCtx | null>(null);
const EMPTY_WISHLIST: string[] = [];
const GUEST_WISHLIST_KEY = "laptomo_wishlist_guest";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const wishlistKey = user
    ? `laptomo_wishlist_user_${user.id}`
    : GUEST_WISHLIST_KEY;
  const [storedIds, setIds, wishlistReady] = useLocalStorage<string[]>(
    wishlistKey,
    [],
  );
  const ready = authReady && wishlistReady;
  const ids = ready ? storedIds : EMPTY_WISHLIST;

  useEffect(() => {
    migrateLegacyKey("laptomo_wishlist", GUEST_WISHLIST_KEY);
  }, []);

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
