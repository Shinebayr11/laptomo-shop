import { Metadata } from "next";
import { getProducts } from "@/lib/data";
import { CatalogView } from "@/components/product/CatalogView";
import { SortKey } from "@/types";

export const metadata: Metadata = { title: "Бүтээгдэхүүн" };

type Search = { [key: string]: string | undefined };

export default async function ProductsPage({ searchParams }: { searchParams: Search }) {
  const products = await getProducts();
  return (
    <div className="page-enter">
      <CatalogView
        products={products}
        initial={{
          query: searchParams.query ?? "",
          category: searchParams.category ?? "",
          subcategory: searchParams.subcategory ?? "",
          brand: searchParams.brand ?? "",
          sort: (searchParams.sort as SortKey) ?? "newest",
        }}
      />
    </div>
  );
}
