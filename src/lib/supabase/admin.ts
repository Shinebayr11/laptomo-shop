import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Service role түлхүүр нь RLS-ийг тойрдог тул ЗӨВХӨН server талд ашиглана.
 * `server-only` импорт нь client bundle-д орохоос хамгаална.
 */
export const isServiceRoleConfigured = Boolean(url && serviceKey?.trim());

export function createAdminSupabase() {
  if (!isServiceRoleConfigured) return null;
  return createClient(url!, serviceKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
