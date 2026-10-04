"use client";
import { useState } from "react";
import { Review } from "@/types";
import { RatingStars } from "@/components/ui/RatingStars";
import { formatDate } from "@/utils/format";
import { ReviewForm } from "./ReviewForm";
import { useAuth } from "@/hooks/useAuth";
import { createClient, isSupabaseEnabled } from "@/lib/supabase/client";

export function ProductReviews({ productId, initial }: { productId: string; initial: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initial);
  const { user, ready } = useAuth();

  const addReview = async (rating: number, comment: string) => {
    if (!user) throw new Error("Сэтгэгдэл үлдээхийн тулд нэвтэрнэ үү.");

    const r: Review = {
      id: crypto.randomUUID(), product_id: productId, user_id: user.id,
      user_name: user.name, rating, comment, images: [],
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseEnabled) {
      throw new Error("Сэтгэгдэл үлдээхийн тулд Supabase холболт шаардлагатай.");
    }
    const { data, error } = await createClient()!
      .from("reviews")
      .insert(r)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    setReviews((prev) => [data as Review, ...prev]);
  };

  return (
    <section className="mt-16">
      <h3 className="mb-6 font-display text-2xl font-bold text-ink">Сэтгэгдэл ({reviews.length})</h3>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {reviews.length === 0 && <p className="text-sm text-muted">Одоогоор сэтгэгдэл алга. Эхнийх нь та байгаарай!</p>}
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-line pb-6">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink">{r.user_name}</span>
                <span className="text-xs text-muted">{formatDate(r.created_at)}</span>
              </div>
              <div className="mt-1.5"><RatingStars rating={r.rating} /></div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{r.comment}</p>
            </div>
          ))}
        </div>
        <ReviewForm onSubmit={addReview} canSubmit={ready && Boolean(user)} />
      </div>
    </section>
  );
}
