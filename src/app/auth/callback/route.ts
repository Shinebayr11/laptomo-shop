import { NextResponse } from "next/server";
import { createServerSupabase, isSupabaseEnabled } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (!isSupabaseEnabled || !code) {
    return NextResponse.redirect(`${origin}/login`);
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
    return NextResponse.redirect(`${origin}/login?confirmed=0`);
  }

  return NextResponse.redirect(`${origin}/login?confirmed=1`);
}
