export const SITE = {
  name: "LS Tech Store",
  tagline: "Premium laptop & electronics store",
  description:
    "LS Tech Store — premium laptop, electronics, monitor болон дагалдах хэрэгслийн онлайн дэлгүүр. Чанартай бараа, баталгаатай үйлчилгээ, хурдан хүргэлт.",
  url: "https://lstechstore.mn",
  phone: "+976 7700 7700",
  email: "hello@lstechstore.mn",
  address: "Улаанбаатар, Сүхбаатар дүүрэг, Их Тойруу",
  social: {
    facebook: "https://facebook.com/lstechstore",
    instagram: "https://instagram.com/lstechstore",
  },
};

/** Үүнээс бага үлдэгдэлтэй барааг "нөөц дуусаж байна" гэж тэмдэглэнэ. */
export const LOW_STOCK_THRESHOLD = 5;

export const NAV_LINKS = [
  { href: "/", label: "Нүүр" },
  { href: "/products", label: "Бүх бүтээгдэхүүн" },
  { href: "/products?category=triple", label: "Гурвалсан" },
  { href: "/products?category=dual", label: "Хос" },
  { href: "/products?category=single", label: "Зөөврийн монитор" },
  { href: "/products?category=accessory", label: "Дагалдах хэрэгсэл" },
  { href: "/products?category=phone", label: "Утасны хэрэгсэл" },
];

export const BRANDS = ["Apple", "ASUS", "Dell", "Lenovo", "Samsung", "Logitech", "Baseus", "Anker", "Xiaomi", "HP"];

export const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Шинэ нь" },
  { value: "cheapest", label: "Хямд нь" },
  { value: "expensive", label: "Үнэтэй нь" },
  { value: "popular", label: "Эрэлттэй нь" },
];
