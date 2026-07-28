import { NextResponse } from "next/server";
import { createServerSupabase, isSupabaseEnabled } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next");
  const nextPath =
    requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : null;
  const origin = requestUrl.origin;
  const errorPath =
    nextPath === "/reset-password"
      ? "/forgot-password?error=expired"
      : "/login?confirmed=0";

  if (!isSupabaseEnabled || !code) {
    return NextResponse.redirect(`${origin}${errorPath}`);
  }

  const supabase = createServerSupabase();
  let error: unknown = null;
  try {
    const result = await supabase!.auth.exchangeCodeForSession(code);
    error = result.error;
  } catch (caught) {
    error = caught;
  }

  if (error) {
    return NextResponse.redirect(`${origin}${errorPath}`);
  }

  return NextResponse.redirect(
    nextPath ? new URL(nextPath, origin) : `${origin}/login?confirmed=1`,
  );
}
