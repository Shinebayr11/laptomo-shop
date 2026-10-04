import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Supabase тохируулсан эсэх. Бүх бизнес өгөгдөл зөвхөн DB-ээс уншигдана. */
export const isSupabaseEnabled = Boolean(url && anon);

export function createClient() {
  if (!isSupabaseEnabled) return null;
  return createBrowserClient(url!, anon!);
}
