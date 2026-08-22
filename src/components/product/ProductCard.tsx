"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { Product } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/store/CartContext";
import { useWishlist } from "@/store/WishlistContext";
import { formatMNT, discountPercent, effectivePrice, cn } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { RatingStars } from "@/components/ui/RatingStars";

export function ProductCard({ product }: { product: Product }) {
  const { user, ready } = useAuth();
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const off = discountPercent(product.price, product.discount_price);
  const liked = has(product.id);

  return (
    <div className="group relative flex flex-col">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[384/341] overflow-hidden rounded-xl2 bg-white shadow-sm">
        <motion.div
          className="absolute inset-0"
          initial={{ y: "60%" }}
          whileInView={{ y: "0%" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            unoptimized
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-contain p-2 transition-transform duration-700 group-hover:scale-105"
          />
        </motion.div>
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {off > 0 && <Badge tone="sale">-{off}%</Badge>}
          {product.is_new && <Badge tone="new">Шинэ</Badge>}
        </div>
        {product.stock === 0 && (
          <div className="absolute inset-0 grid place-items-center bg-bg/70 text-sm font-medium uppercase tracking-wide2 text-ink">Дууссан</div>
        )}
      </Link>

      <button
        aria-label="Хадгалах"
        onClick={() => toggle(product.id)}
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-bg/80 backdrop-blur transition-colors hover:text-accent"
      >
        <Heart size={16} className={cn(liked && "fill-accent text-accent")} />
      </button>

      <div className="mt-4 flex flex-1 flex-col">
        <span className="text-[11px] uppercase tracking-wide2 text-muted">{product.brand}</span>
        <Link href={`/products/${product.slug}`} className="mt-1 line-clamp-2 font-display text-lg leading-snug text-ink hover:text-accent">
          {product.title}
        </Link>
        <div className="mt-1.5"><RatingStars rating={product.rating} /></div>

        <div className="mt-3 flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-ink">{formatMNT(effectivePrice(product.price, product.discount_price))}</span>
            {off > 0 && <span className="text-xs text-muted line-through">{formatMNT(product.price)}</span>}
          </div>
          {ready && user && (
            <button
              aria-label="Сагсанд нэмэх"
              disabled={product.stock === 0}
              onClick={() => add(product)}
              className="grid h-10 w-10 place-items-center rounded-full bg-ink text-bg transition-all hover:bg-accent disabled:opacity-30"
            >
              <ShoppingBag size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
