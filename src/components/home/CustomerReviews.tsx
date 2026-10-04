import { RatingStars } from "@/components/ui/RatingStars";
import { Review } from "@/types";
import { SectionHeader } from "./SectionHeader";

export function CustomerReviews({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null;
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader eyebrow="Сэтгэгдэл" title="Хэрэглэгчид юу гэж байна вэ" />
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.slice(0, 3).map((review) => (
            <figure key={review.id} className="flex flex-col rounded-xl2 border border-line bg-bg p-7">
              <RatingStars rating={review.rating} size={16} />
              <blockquote className="mt-4 flex-1 font-display text-lg italic leading-relaxed text-ink">“{review.comment}”</blockquote>
              <figcaption className="mt-5">
                <p className="font-medium text-ink">{review.user_name}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
