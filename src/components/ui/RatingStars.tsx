"use client";
import { Star } from "lucide-react";
import { cn } from "@/utils/format";

export function RatingStars({ rating, size = 14, onSelect }: { rating: number; size?: number; onSelect?: (r: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          onClick={() => onSelect?.(i)}
          className={cn(
            onSelect && "cursor-pointer",
            i <= Math.round(rating) ? "fill-accent text-accent" : "text-line"
          )}
        />
      ))}
    </div>
  );
}
