import { RatingStars } from "@/components/ui/RatingStars";
import { SectionHeader } from "./SectionHeader";

const TESTIMONIALS = [
  { name: "Болормаа Б.", role: "Дизайнер", rating: 5, text: "MacBook-оо LS Tech Store-оос авсан. Хүргэлт хурдан, баглаа боодол маш цэвэрхэн. Дахин авна!" },
  { name: "Тэмүүлэн Г.", role: "Хөгжүүлэгч", rating: 5, text: "Үнэ боломжийн, бараа жинхэнэ. Албан ёсны баталгаатай гэдэг нь сэтгэл амар байлгадаг." },
  { name: "Сараа Н.", role: "Оюутан", rating: 4, text: "Чихэвчээ маш хямдхан авлаа. Зөвлөгөө өгсөн ажилтанд баярлалаа." },
];

export function CustomerReviews() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader eyebrow="Сэтгэгдэл" title="Хэрэглэгчид юу гэж байна вэ" />
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="flex flex-col rounded-xl2 border border-line bg-bg p-7">
              <RatingStars rating={t.rating} size={16} />
              <blockquote className="mt-4 flex-1 font-display text-lg italic leading-relaxed text-ink">“{t.text}”</blockquote>
              <figcaption className="mt-5">
                <p className="font-medium text-ink">{t.name}</p>
                <p className="text-xs uppercase tracking-wide2 text-muted">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
