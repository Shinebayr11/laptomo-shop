"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CheckoutPage() {
  const { lines, subtotal, ready: cartReady } = useCart();
  const { user, ready: authReady } = useAuth();
  const router = useRouter();
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (authReady && !user) {
      router.replace("/login?next=/checkout");
    }
  }, [authReady, user, router]);

  if (!authReady || !cartReady || !user) return null;

  return (
    <div className="page-enter mx-auto max-w-6xl px-5 py-12 lg:px-8">
      <h1 className="mb-8 font-display text-4xl font-bold tracking-tightest text-ink">Төлбөр тооцоо</h1>
      {lines.length === 0 && !completed ? (
        <EmptyState title="Сагс хоосон байна" actionLabel="Дэлгүүр үзэх" actionHref="/products" />
      ) : (
        <div className={completed ? "mx-auto max-w-2xl" : "grid gap-10 lg:grid-cols-[1fr_360px]"}>
          <CheckoutForm onComplete={() => setCompleted(true)} />
          {!completed && <CartSummary subtotal={subtotal} cta={false} />}
        </div>
      )}
    </div>
  );
}
