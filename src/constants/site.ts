export const SITE = {
  name: "LS Tech Store",
  tagline: "Premium laptop & electronics store",
  description:
    "LS Tech Store — premium laptop, electronics, monitor болон дагалдах хэрэгслийн онлайн дэлгүүр. Чанартай бараа, баталгаатай үйлчилгээ, хурдан хүргэлт.",
  // Үндсэн хаяг. Apex (lstechstore.com) нь энэ рүү 308-аар чиглүүлдэг.
  // Metadata, OG зураг, sitemap бүгд эндээс үүсдэг тул домэйн солиход
  // зөвхөн энэ мөрийг засна.
  url: "https://www.lstechstore.com",
  phone: "+976 9715 1615",
  email: "Laptomoscreen@gmail.com",
  address: "Улаанбаатар, Хан-Уул дүүрэг, 8-хороо, Шинэ яармаг хороолол 746-р байр",
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
