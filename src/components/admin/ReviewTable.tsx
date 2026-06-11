"use client";
import { Trash2 } from "lucide-react";
import { Review } from "@/types";
import { RatingStars } from "@/components/ui/RatingStars";
import { formatDate } from "@/utils/format";

export function ReviewTable({ reviews, productTitle, onDelete }: { reviews: Review[]; productTitle: (id: string) => string; onDelete: (r: Review) => void }) {
  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r.id} className="flex items-start justify-between gap-4 rounded-2xl border border-line p-5">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium text-ink">{r.user_name}</span>
              <RatingStars rating={r.rating} />
              <span className="text-xs text-muted">{formatDate(r.created_at)}</span>
            </div>
            <p className="text-xs uppercase tracking-wide2 text-accent">{productTitle(r.product_id)}</p>
            <p className="text-sm text-muted">{r.comment}</p>
          </div>
          <button onClick={() => onDelete(r)} className="shrink-0 rounded-lg border border-line p-2 text-muted hover:text-red-600" aria-label="Устгах">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
