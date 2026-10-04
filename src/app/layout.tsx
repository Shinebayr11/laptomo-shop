import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE } from "@/constants/site";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { getCategories, getProducts } from "@/lib/data";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: ["лаптоп", "macbook", "монитор", "техник", "LS Tech Store", "Монгол"],
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    locale: "mn_MN",
    type: "website",
  },
};

export const revalidate = 60;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);
  return (
    <html lang="mn" suppressHydrationWarning>
      <body className="grain min-h-screen font-sans antialiased">
        <Providers products={products}>
          {!isSupabaseEnabled && (
            <div className="bg-amber-500 px-4 py-2 text-center text-sm font-medium text-black">
              Өгөгдлийн сан холбогдоогүй байна. `.env.local` дотор Supabase
              тохиргоогоо оруулна уу.
            </div>
          )}
          <Header categories={categories} />
          <main className="min-h-[60vh]">{children}</main>
          <Footer categories={categories} />
        </Providers>
      </body>
    </html>
  );
}
