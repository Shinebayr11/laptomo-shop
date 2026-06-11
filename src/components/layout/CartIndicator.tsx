"use client";
import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";
import { useCart } from "@/store/CartContext";
import { useWishlist } from "@/store/WishlistContext";

export function CartIndicator() {
  const { count } = useCart();
  const { count: wish } = useWishlist();
  return (
    <div className="flex items-center gap-1">
      <Link href="/wishlist" aria-label="Хадгалсан" className="relative grid h-9 w-9 place-items-center text-ink hover:text-accent">
        <Heart size={18} />
        {wish > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-accent text-[9px] font-bold text-white">{wish}</span>}
      </Link>
      <Link href="/cart" aria-label="Сагс" className="relative grid h-9 w-9 place-items-center text-ink hover:text-accent">
        <ShoppingBag size={18} />
        {count > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-accent text-[9px] font-bold text-white">{count}</span>}
      </Link>
    </div>
  );
}
