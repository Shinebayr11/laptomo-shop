import { getProducts } from "@/lib/data";
import { WishlistView } from "@/components/product/WishlistView";

export const metadata = { title: "Хадгалсан бараа" };

export default async function WishlistPage() {
  const products = await getProducts();
  return <div className="page-enter"><WishlistView products={products} /></div>;
}
