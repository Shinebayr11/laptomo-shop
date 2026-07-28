"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CartPage() {
  const { lines, subtotal, ready: cartReady } = useCart();
  const { user, ready: authReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authReady && !user) {
      router.replace("/login?next=/cart");
    }
  }, [authReady, user, router]);

  if (!authReady || !cartReady || !user) return null;

  return (
    <div className="page-enter mx-auto max-w-6xl px-5 py-12 lg:px-8">
      <h1 className="mb-8 font-display text-4xl font-bold tracking-tightest text-ink">Таны сагс</h1>
      {lines.length === 0 ? (
        <EmptyState title="Таны сагс хоосон байна" hint="Дэлгүүрээс бараа сонгож сагсандаа нэмээрэй." actionLabel="Дэлгүүр үзэх" actionHref="/products" />
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>{lines.map((l) => <CartItem key={l.product.id} line={l} />)}</div>
          <CartSummary subtotal={subtotal} />
        </div>
      )}
    </div>
  );
}
