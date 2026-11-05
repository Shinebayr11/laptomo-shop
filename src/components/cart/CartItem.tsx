"use client";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { CartLine } from "@/types";
import { useCart } from "@/store/CartContext";
import { formatMNT, effectivePrice } from "@/utils/format";

export function CartItem({ line }: { line: CartLine }) {
  const { setQty, remove } = useCart();
  const { product, quantity } = line;
  const price = effectivePrice(product.price, product.discount_price);

  return (
    <div className="flex gap-3 border-b border-line py-5 sm:gap-4">
      <Link href={`/products/${product.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface sm:h-24 sm:w-24">
        <Image src={product.images[0]} alt={product.title} fill sizes="(max-width: 640px) 80px, 96px" className="object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-between gap-2">
          <Link href={`/products/${product.slug}`} className="min-w-0 break-words font-display text-base text-ink hover:text-accent">{product.title}</Link>
          <button onClick={() => remove(product.id)} className="grid h-9 w-9 shrink-0 place-items-center text-muted hover:text-red-500" aria-label="Сагснаас хасах"><X size={16} /></button>
        </div>
        {product.brand && (
          <span className="text-xs uppercase tracking-wide2 text-muted">{product.brand}</span>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-auto sm:justify-between">
          <div className="flex items-center rounded-full border border-line">
            <button onClick={() => setQty(product.id, quantity - 1)} className="grid h-8 w-8 place-items-center hover:text-accent"><Minus size={13} /></button>
            <span className="w-8 text-center text-sm">{quantity}</span>
            <button onClick={() => setQty(product.id, quantity + 1)} className="grid h-8 w-8 place-items-center hover:text-accent"><Plus size={13} /></button>
          </div>
          <span className="ml-auto whitespace-nowrap font-medium text-ink">{formatMNT(price * quantity)}</span>
        </div>
      </div>
    </div>
  );
}
