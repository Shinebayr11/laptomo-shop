"use client";
import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { CartProvider } from "@/store/CartContext";
import { WishlistProvider } from "@/store/WishlistContext";
import { OrdersProvider } from "@/store/OrdersContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <OrdersProvider>
        <CartProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
      </OrdersProvider>
    </ThemeProvider>
  );
}
