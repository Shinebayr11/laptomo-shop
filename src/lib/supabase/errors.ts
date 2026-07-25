export const SUPABASE_CONNECTION_MESSAGE =
  "Supabase-тэй холбогдож чадсангүй. Интернэт, DNS эсвэл Supabase project URL-ээ шалгана уу.";

export function isSupabaseConnectionError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const lower = message.toLowerCase();

  return (
    lower.includes("fetch failed") ||
    lower.includes("enotfound") ||
    lower.includes("econnrefused") ||
    lower.includes("networkerror") ||
    lower.includes("failed to fetch")
  );
}

export function normalizeSupabaseError(error: unknown) {
  if (isSupabaseConnectionError(error)) {
    return new Error(SUPABASE_CONNECTION_MESSAGE);
  }

  return error instanceof Error ? error : new Error(String(error));
}
