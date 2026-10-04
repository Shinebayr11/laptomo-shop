import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { email?: unknown }
    | null;
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { error: "Зөв имэйл хаяг оруулна уу." },
      { status: 400 },
    );
  }

  const admin = createAdminSupabase();
  if (!admin) {
    return NextResponse.json(
      { error: "Newsletter-ийн server тохиргоо дутуу байна." },
      { status: 503 },
    );
  }

  const { error } = await admin.from("newsletter_subscribers").upsert(
    { email },
    { onConflict: "email", ignoreDuplicates: true },
  );

  if (error) {
    return NextResponse.json(
      { error: "Имэйл бүртгэж чадсангүй. Дахин оролдоно уу." },
      { status: 503 },
    );
  }

  return NextResponse.json({ subscribed: true }, { status: 201 });
}
