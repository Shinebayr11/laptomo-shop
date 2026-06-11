import { Review } from "@/types";

export const SEED_REVIEWS: Review[] = [
  {
    id: "r-001", product_id: "p-001", user_id: "u-002", user_name: "Болормаа Б.",
    rating: 5, comment: "Гайхалтай хурдан, дэлгэц нь үнэхээр тод. Видео засварт төгс ажиллаж байна.",
    images: [], created_at: "2025-05-25T10:00:00Z",
  },
  {
    id: "r-002", product_id: "p-001", user_id: "u-003", user_name: "Тэмүүлэн Г.",
    rating: 5, comment: "Батерей бүтэн өдөр тэсэж байна. Үнэд хүрэхүйц чанартай.",
    images: [], created_at: "2025-05-27T14:30:00Z",
  },
  {
    id: "r-003", product_id: "p-002", user_id: "u-004", user_name: "Анар Д.",
    rating: 4, comment: "Тоглоомд маш зөв, гэхдээ жоохон халдаг. Сэнс нь чанга.",
    images: [], created_at: "2025-05-20T09:15:00Z",
  },
  {
    id: "r-004", product_id: "p-007", user_id: "u-002", user_name: "Болормаа Б.",
    rating: 5, comment: "Хамгийн тав тухтай хулгана. Гар чилэхээ больсон.",
    images: [], created_at: "2025-05-18T16:45:00Z",
  },
  {
    id: "r-005", product_id: "p-011", user_id: "u-005", user_name: "Сараа Н.",
    rating: 5, comment: "Чимээ дарагч нь гайхалтай. Автобусанд хөгжим сонсоход тамга.",
    images: [], created_at: "2025-05-29T11:20:00Z",
  },
  {
    id: "r-006", product_id: "p-005", user_id: "u-003", user_name: "Тэмүүлэн Г.",
    rating: 4, comment: "Өнгө нь маш сайхан. USB-C нэг кабелиар ажилладаг нь тав тухтай.",
    images: [], created_at: "2025-05-22T08:00:00Z",
  },
];
