import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Supabase тохируулсан эсэх — тохируулаагүй бол seed дата дээр ажиллана. */
export const isSupabaseEnabled = Boolean(url && anon);

export function createClient() {
  if (!isSupabaseEnabled) return null;
  return createBrowserClient(url!, anon!);
}
