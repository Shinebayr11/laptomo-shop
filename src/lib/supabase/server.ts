import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseEnabled = Boolean(url && anon);

/**
 * Cookie ашиглахгүй client — build/generateStaticParams зэрэг request context
 * байхгүй үед хэрэглэнэ. cookies() дуудвал тэнд алдаа гарч, DB-ийн оронд seed
 * дата руу чимээгүй унадаг байсныг үүгээр зассан.
 */
export function createStaticSupabase() {
  if (!isSupabaseEnabled) return null;
  return createServerClient(url!, anon!, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}

export function createServerSupabase() {
  if (!isSupabaseEnabled) return null;
  const cookieStore = cookies();
  return createServerClient(url!, anon!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (items: { name: string; value: string; options?: Record<string, unknown> }[]) => {
        try {
          items.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          /* server component-д дуудвал алгасна */
        }
      },
    },
  });
}
