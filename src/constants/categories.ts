import { Category } from "@/types";

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export const CATEGORIES: Category[] = [
  {
    slug: "triple",
    name: "Гурвалсан дэлгэц",
    description: "Лаптопыг гурван дэлгэцтэй болгох зөөврийн өргөтгөгч",
    image: img("photo-1593305841991-05c297ba4575"),
    subcategories: [
      { slug: "triple-14", name: "14 инч" },
      { slug: "triple-156", name: "15.6 инч" },
    ],
  },
  {
    slug: "dual",
    name: "Хос дэлгэц",
    description: "Нэг талдаа нэмэлт дэлгэцтэй өргөтгөгч",
    image: img("photo-1527443224154-c4a3942d3acf"),
    subcategories: [
      { slug: "dual-14", name: "14 инч" },
      { slug: "dual-156", name: "15.6 инч" },
    ],
  },
  {
    slug: "single",
    name: "Зөөврийн монитор",
    description: "Дангаар ашиглах FHD зөөврийн дэлгэц",
    image: img("photo-1547949003-9792a18a2601"),
    subcategories: [
      { slug: "mon-133", name: "13.3 инч" },
      { slug: "mon-156", name: "15.6 инч" },
      { slug: "mon-16", name: "16 инч" },
    ],
  },
  {
    slug: "phone",
    name: "Гар утасны хэрэгсэл",
    description: "Кейс, цэнэглэгч, кабель, дэлгэц хамгаалагч, чихэвч",
    image: img("photo-1588872657578-7efd1f1555ed"),
    subcategories: [
      { slug: "ph-case", name: "Кейс" },
      { slug: "ph-charger", name: "Цэнэглэгч" },
      { slug: "ph-cable", name: "Кабель" },
      { slug: "ph-protector", name: "Дэлгэц хамгаалагч" },
      { slug: "ph-earphone", name: "Чихэвч" },
      { slug: "ph-other", name: "Бусад" },
    ],
  },
  {
    slug: "accessory",
    name: "Дагалдах хэрэгсэл",
    description: "Кабель, цэнэглэгч, тавиур, хадгалах гэр",
    image: img("photo-1606220588913-b3aacb4d2f46"),
    subcategories: [
      { slug: "acc-charger", name: "Цэнэглэгч" },
      { slug: "acc-cable", name: "Кабель / Адаптер" },
      { slug: "acc-stand", name: "Тавиур" },
      { slug: "acc-case", name: "Хадгалах гэр" },
      { slug: "acc-other", name: "Бусад" },
    ],
  },
];

export const findCategory = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug);

export const allSubcategories = CATEGORIES.flatMap((c) =>
  c.subcategories.map((s) => ({ ...s, parent: c.slug })),
);
