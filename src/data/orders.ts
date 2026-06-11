import { Order } from "@/types";

export const SEED_ORDERS: Order[] = [
  {
    id: "ORD-1042", user_id: "u-002", customer_name: "Болормаа Б.",
    customer_phone: "99112233", address: "ХУД, 3-р хороо, 24-р байр",
    items: [{ product_id: "p-007", title: "Logitech MX Master 3S", price: 280000, quantity: 1, image: "" }],
    total_price: 280000, status: "delivered", created_at: "2025-05-26T10:00:00Z",
  },
  {
    id: "ORD-1043", user_id: "u-003", customer_name: "Тэмүүлэн Г.",
    customer_phone: "88223344", address: "СБД, 1-р хороо, Оффис тауэр",
    items: [{ product_id: "p-001", title: "MacBook Pro 14 M3", price: 8290000, quantity: 1, image: "" }],
    total_price: 8290000, status: "processing", created_at: "2025-05-28T13:20:00Z",
  },
  {
    id: "ORD-1044", user_id: "u-005", customer_name: "Сараа Н.",
    customer_phone: "95558877", address: "БЗД, 13-р хороо, 45А байр",
    items: [
      { product_id: "p-011", title: "AirPods Pro 2", price: 789000, quantity: 1, image: "" },
      { product_id: "p-012", title: "iPhone 15 Pro гэр", price: 49000, quantity: 2, image: "" },
    ],
    total_price: 887000, status: "pending", created_at: "2025-05-30T09:45:00Z",
  },
];
