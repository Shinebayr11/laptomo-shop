"use client";
import { Review } from "@/types";
import { useAdmin } from "@/store/AdminContext";
import { ReviewTable } from "@/components/admin/ReviewTable";
import { AdminError } from "@/components/admin/AdminError";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdminReviewsPage() {
  const { reviews, products, ready, deleteReview, actionError, clearActionError } =
    useAdmin();
  if (!ready) return <p className="text-sm text-muted">Ачааллаж байна...</p>;

  const productTitle = (id: string) => products.find((p) => p.id === id)?.title ?? "Бүтээгдэхүүн";
  const handleDelete = (r: Review) => { if (confirm("Энэ сэтгэгдлийг устгах уу?")) deleteReview(r.id); };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-ink">Сэтгэгдэл</h1>
        <p className="mt-1 text-sm text-muted">Нийт {reviews.length} сэтгэгдэл · зохисгүйг устгана уу</p>
      </header>

      <AdminError message={actionError} onDismiss={clearActionError} />

      {reviews.length ? (
        <ReviewTable reviews={reviews} productTitle={productTitle} onDelete={handleDelete} />
      ) : (
        <EmptyState title="Сэтгэгдэл алга" hint="Одоогоор сэтгэгдэл бүртгэгдээгүй байна." />
      )}
    </div>
  );
}
