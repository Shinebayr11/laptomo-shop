export type UserRole = "admin" | "customer";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

export interface Spec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  discount_price: number | null;
  images: string[];
  category: string; // main category slug
  subcategory: string; // brand / sub slug
  brand: string;
  description: string;
  specifications: Spec[];
  stock: number;
  rating: number;
  reviews_count: number;
  is_featured: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  is_archived?: boolean;
  created_at: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  image: string;
  subcategories: { slug: string; name: string }[];
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  product_id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  items: OrderItem[];
  total_price: number;
  status: OrderStatus;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  images: string[];
  created_at: string;
}

export interface CartLine {
  product: Product;
  quantity: number;
}

export type SortKey = "newest" | "cheapest" | "expensive" | "popular";

export interface ProductFilters {
  query: string;
  category: string;
  subcategory: string;
  brand: string;
  minPrice: number | null;
  maxPrice: number | null;
  sort: SortKey;
}
