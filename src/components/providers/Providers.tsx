"use client";
import { ThemeProvider } from "next-themes";
import { ReactNode, useMemo } from "react";
import { CartProvider } from "@/store/CartContext";
import { WishlistProvider } from "@/store/WishlistContext";
import { OrdersProvider } from "@/store/OrdersContext";
import { Product } from "@/types";

export function Providers({
  children,
  products,
}: {
  children: ReactNode;
  products: Product[];
}) {
  const productIds = useMemo(
    () => products.map((product) => product.id),
    [products],
  );
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <OrdersProvider>
        <CartProvider products={products}>
          <WishlistProvider productIds={productIds}>
            {children}
          </WishlistProvider>
        </CartProvider>
      </OrdersProvider>
    </ThemeProvider>
  );
}
