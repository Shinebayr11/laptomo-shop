"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Check,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/store/CartContext";
import { useWishlist } from "@/store/WishlistContext";
import { formatMNT, discountPercent, effectivePrice, cn } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { RatingStars } from "@/components/ui/RatingStars";
import { Button } from "@/components/ui/Button";
import { findCategory } from "@/constants/categories";

export function ProductInfo({ product }: { product: Product }) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const off = discountPercent(product.price, product.discount_price);
  const cat = findCategory(product.category);

  const handleOrder = () => {
    add(product, qty);
    router.push("/checkout");
  };

  return (
    <div>
      <div className="flex items-center gap-3 text-xs uppercase tracking-wide2 text-muted">
        <span>{product.brand}</span>
        <span>·</span>
        <span>{cat?.name}</span>
      </div>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tightest text-ink">
        {product.title}
      </h1>

      <div className="mt-4 flex items-center gap-3">
        <RatingStars rating={product.rating} size={16} />
        <span className="text-sm text-muted">
          {product.rating} · {product.reviews_count} сэтгэгдэл
        </span>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <span className="font-display text-3xl font-bold text-ink">
          {formatMNT(effectivePrice(product.price, product.discount_price))}
        </span>
        {off > 0 && (
          <>
            <span className="text-lg text-muted line-through">
              {formatMNT(product.price)}
            </span>
            <Badge tone="sale">-{off}%</Badge>
          </>
        )}
      </div>

      <p className="mt-6 max-w-prose leading-relaxed text-muted">
        {product.description}
      </p>

      <div className="mt-7 flex items-center gap-3">
        {product.stock > 0 ? (
          <span className="flex items-center gap-1.5 text-sm text-green-600">
            <Check size={15} /> Бэлэн ({product.stock} ширхэг)
          </span>
        ) : (
          <span className="text-sm text-red-500">Дууссан</span>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <div className="flex items-center rounded-full border border-line">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid h-11 w-11 place-items-center text-ink hover:text-accent"
          >
            <Minus size={16} />
          </button>
          <span className="w-10 text-center text-sm font-medium">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            className="grid h-11 w-11 place-items-center text-ink hover:text-accent"
          >
            <Plus size={16} />
          </button>
        </div>
        <Button
          size="lg"
          onClick={handleOrder}
          disabled={product.stock === 0}
          className="flex-1"
        >
          <ShoppingBag size={18} /> Захиалах
        </Button>
        <button
          onClick={() => toggle(product.id)}
          className="grid h-[52px] w-[52px] place-items-center rounded-full border border-line text-ink hover:text-accent"
        >
          <Heart
            size={18}
            className={cn(has(product.id) && "fill-accent text-accent")}
          />
        </button>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl2 border border-line p-4 text-sm">
          <Truck size={18} className="text-accent" />
          <span className="text-muted">Улаанбаатар хотод үнэгүй хүргэлт</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl2 border border-line p-4 text-sm">
          <ShieldCheck size={18} className="text-accent" />
          <span className="text-muted">Албан ёсны баталгаатай</span>
        </div>
      </div>
    </div>
  );
}
