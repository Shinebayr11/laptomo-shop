import { Product, ProductFilters } from "@/types";
import { effectivePrice } from "./format";

export function filterProducts(products: Product[], f: ProductFilters): Product[] {
  let list = [...products];

  if (f.query.trim()) {
    const q = f.query.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }
  if (f.category) list = list.filter((p) => p.category === f.category);
  if (f.subcategory) list = list.filter((p) => p.subcategory === f.subcategory);
  if (f.brand) list = list.filter((p) => p.brand === f.brand);
  if (f.minPrice != null)
    list = list.filter((p) => effectivePrice(p.price, p.discount_price) >= f.minPrice!);
  if (f.maxPrice != null)
    list = list.filter((p) => effectivePrice(p.price, p.discount_price) <= f.maxPrice!);

  switch (f.sort) {
    case "cheapest":
      list.sort((a, b) => effectivePrice(a.price, a.discount_price) - effectivePrice(b.price, b.discount_price));
      break;
    case "expensive":
      list.sort((a, b) => effectivePrice(b.price, b.discount_price) - effectivePrice(a.price, a.discount_price));
      break;
    case "popular":
      list.sort((a, b) => b.reviews_count - a.reviews_count);
      break;
    default:
      list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  }
  return list;
}

export const emptyFilters: ProductFilters = {
  query: "", category: "", subcategory: "", brand: "",
  minPrice: null, maxPrice: null, sort: "newest",
};
