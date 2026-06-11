"use client";
import { useState } from "react";
import { RatingStars } from "@/components/ui/RatingStars";
import { Button } from "@/components/ui/Button";

export function ReviewForm({ onSubmit }: { onSubmit: (rating: number, comment: string) => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submit = () => {
    if (!comment.trim()) return;
    onSubmit(rating, comment.trim());
    setComment(""); setRating(5);
  };

  return (
    <div className="rounded-xl2 border border-line p-6">
      <h4 className="font-display text-lg text-ink">Сэтгэгдэл үлдээх</h4>
      <div className="mt-4 flex items-center gap-3">
        <span className="text-sm text-muted">Үнэлгээ:</span>
        <RatingStars rating={rating} size={22} onSelect={setRating} />
      </div>
      <textarea
        value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
        placeholder="Энэ бүтээгдэхүүний талаар бодлоо хуваалцаарай..."
        className="mt-4 w-full resize-none rounded-lg border border-line bg-bg p-3 text-sm outline-none focus:border-accent"
      />
      <Button onClick={submit} size="sm" className="mt-3">Илгээх</Button>
    </div>
  );
}
