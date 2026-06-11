"use client";
import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { CartProvider } from "@/store/CartContext";
import { WishlistProvider } from "@/store/WishlistContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </ThemeProvider>
  );
}
