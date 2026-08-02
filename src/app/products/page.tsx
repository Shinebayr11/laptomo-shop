import { Suspense } from "react";
import { Metadata } from "next";
import { getProducts } from "@/lib/data";
import { CatalogView } from "@/components/product/CatalogView";
import { PageLoader } from "@/components/ui/PageLoader";
import { SortKey } from "@/types";

export const metadata: Metadata = { title: "Бүтээгдэхүүн" };

type Search = { [key: string]: string | undefined };

async function Catalog({ searchParams }: { searchParams: Search }) {
  const products = await getProducts();
  const initial = {
    query: searchParams.query ?? "",
    category: searchParams.category ?? "",
    subcategory: searchParams.subcategory ?? "",
    brand: searchParams.brand ?? "",
    sort: (searchParams.sort as SortKey) ?? "newest",
  };

  return (
    <CatalogView
      // CatalogView нь initial-ыг useState-ийн анхны утгаар л уншдаг. Navbar-аас
      // өөр ангилал дарахад Next хуудсыг дахин ачаалдаггүй тул шүүлтүүр хуучнаараа
      // үлддэг байв. key өөрчлөгдөхөд React компонентыг шинээр эхлүүлнэ.
      key={`${initial.query}|${initial.category}|${initial.subcategory}|${initial.brand}|${initial.sort}`}
      products={products}
      initial={initial}
    />
  );
}

export default function ProductsPage({ searchParams }: { searchParams: Search }) {
  return (
    <div className="page-enter">
      {/*
        Suspense-ийг route-ийн loading.tsx-ээр биш энд тавьсан шалтгаан:
        app/loading.tsx нь бүх хуудсыг stream болгосноос болж /products/[slug]
        дээрх notFound() 404-ийн оронд 200 буцаадаг байсан.
      */}
      <Suspense fallback={<PageLoader />}>
        <Catalog searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
