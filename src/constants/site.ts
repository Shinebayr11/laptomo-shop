export const SITE = {
  name: "Laptomo",
  tagline: "Зөөврийн дэлгэц өргөтгөгч",
  description:
    "Laptomo Mongolia — лаптопын зөөврийн дэлгэц өргөтгөгч (гурвалсан, хос, дан монитор) болон дагалдах хэрэгслийн албан ёсны дэлгүүр. Plug & Play, 1080P FHD IPS, нэг кабелиар холбоно.",
  url: "https://laptomo.mn",
  phone: "+976 7700 7700",
  email: "tavtai@laptomo.mn",
  address: "Улаанбаатар, Сүхбаатар дүүрэг, Их Тойруу",
  social: {
    facebook: "https://facebook.com/laptomomongolia",
    instagram: "https://instagram.com/laptomo",
  },
};

export const NAV_LINKS = [
  { href: "/", label: "Нүүр" },
  { href: "/products", label: "Бүх бүтээгдэхүүн" },
  { href: "/products?category=triple", label: "Гурвалсан" },
  { href: "/products?category=dual", label: "Хос" },
  { href: "/products?category=single", label: "Зөөврийн монитор" },
  { href: "/products?category=accessory", label: "Дагалдах хэрэгсэл" },
  { href: "/products?category=phone", label: "Утасны хэрэгсэл" },
];

export const BRANDS = ["Laptomo"];

export const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Шинэ нь" },
  { value: "cheapest", label: "Хямд нь" },
  { value: "expensive", label: "Үнэтэй нь" },
  { value: "popular", label: "Эрэлттэй нь" },
];
