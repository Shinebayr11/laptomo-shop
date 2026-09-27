"use client";
import { useState } from "react";
import { RatingStars } from "@/components/ui/RatingStars";
import { Button } from "@/components/ui/Button";

export function ReviewForm({
  onSubmit,
  canSubmit,
}: {
  onSubmit: (rating: number, comment: string) => Promise<void>;
  canSubmit: boolean;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!comment.trim() || !canSubmit || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit(rating, comment.trim());
      setComment("");
      setRating(5);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Сэтгэгдэл хадгалж чадсангүй.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl2 border border-line p-6">
      <h4 className="font-display text-lg text-ink">Сэтгэгдэл үлдээх</h4>
      {!canSubmit && (
        <p className="mt-2 text-sm text-muted">Сэтгэгдэл үлдээхийн тулд нэвтэрнэ үү.</p>
      )}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-sm text-muted">Үнэлгээ:</span>
        <RatingStars rating={rating} size={22} onSelect={setRating} />
      </div>
      <textarea
        value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
        placeholder="Энэ бүтээгдэхүүний талаар бодлоо хуваалцаарай..."
        className="mt-4 w-full resize-none rounded-lg border border-line bg-bg p-3 text-sm outline-none focus:border-accent"
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <Button onClick={submit} size="sm" className="mt-3" disabled={!canSubmit || busy}>
        {busy ? "Хадгалж байна..." : "Илгээх"}
      </Button>
    </div>
  );
}
