"use client";
import { useCart } from "@/store/CartContext";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CheckoutPage() {
  const { lines, subtotal, ready } = useCart();
  if (!ready) return null;

  return (
    <div className="page-enter mx-auto max-w-6xl px-5 py-12 lg:px-8">
      <h1 className="mb-8 font-display text-4xl font-bold tracking-tightest text-ink">Төлбөр тооцоо</h1>
      {lines.length === 0 ? (
        <EmptyState title="Сагс хоосон байна" actionLabel="Дэлгүүр үзэх" actionHref="/products" />
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <CheckoutForm />
          <CartSummary subtotal={subtotal} cta={false} />
        </div>
      )}
    </div>
  );
}
