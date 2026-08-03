import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Order } from "@/types";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { sendEmail, isEmailConfigured } from "@/lib/email/resend";
import {
  adminOrderEmail,
  customerOrderEmail,
} from "@/lib/email/order-templates";

export const dynamic = "force-dynamic";

/** Supabase Database Webhook-оос ирэх нууц үг. */
const SECRET_HEADER = "x-notify-secret";

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * `orders` хүснэгтэд шинэ мөр орох бүрд Supabase энд дуудна.
 *
 * Client болон Wire webhook хоёулаа нэг л газраар — place_order_for_user
 * дамжуулан захиалга үүсгэдэг тул энэ нь бүх захиалгыг хамарна.
 */
export async function POST(request: NextRequest) {
  const expected = process.env.ORDER_NOTIFY_SECRET?.trim();
  if (!expected) {
    return NextResponse.json(
      { error: "ORDER_NOTIFY_SECRET тохируулаагүй байна." },
      { status: 503 },
    );
  }

  const provided = request.headers.get(SECRET_HEADER) ?? "";
  if (!timingSafeEqual(provided, expected)) {
    return NextResponse.json({ error: "Эрх хүрэхгүй." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as {
    record?: { id?: unknown };
  } | null;
  const orderId =
    typeof payload?.record?.id === "string" ? payload.record.id : null;
  if (!orderId) {
    return NextResponse.json({ error: "order id алга." }, { status: 400 });
  }

  const supabase = createAdminSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY тохируулаагүй байна." },
      { status: 503 },
    );
  }

  // notified_at тэмдэглэгээг эхлээд тавина. Мөр шинэчлэгдээгүй бол өөр
  // дуудлага аль хэдийн боловсруулсан гэсэн үг — давхар илгээхгүй.
  const { data: claimed } = await supabase
    .from("orders")
    .update({ notified_at: new Date().toISOString() })
    .eq("id", orderId)
    .is("notified_at", null)
    .select("*")
    .maybeSingle();

  if (!claimed) {
    // Мөр эзэмшиж чадсангүй: захиалга байхгүй, аль хэдийн илгээгдсэн,
    // эсвэл notified_at багана үүсээгүй (06-order-notify.sql ажиллаагүй).
    return NextResponse.json({
      skipped: "захиалга олдсонгүй эсвэл аль хэдийн илгээгдсэн",
    });
  }

  const order = claimed as Order;

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "RESEND_API_KEY тохируулаагүй байна." },
      { status: 503 },
    );
  }

  // Хэрэглэгчийн имэйлийг auth-аас авна — orders дотор хадгалагддаггүй.
  let customerEmail: string | null = null;
  if (order.user_id) {
    const { data } = await supabase.auth.admin.getUserById(order.user_id);
    customerEmail = data?.user?.email ?? null;
  }

  const adminEmail =
    process.env.ADMIN_NOTIFY_EMAIL?.trim() || "adminlaptomo@gmail.com";
  const results: Record<string, string> = {};

  if (customerEmail) {
    const mail = customerOrderEmail(order);
    const sent = await sendEmail({
      to: customerEmail,
      subject: mail.subject,
      html: mail.html,
      replyTo: adminEmail,
    });
    results.customer = sent.ok ? "sent" : sent.error;
  } else {
    results.customer = "имэйл олдсонгүй";
  }

  const adminMail = adminOrderEmail(order);
  const sentAdmin = await sendEmail({
    to: adminEmail,
    subject: adminMail.subject,
    html: adminMail.html,
  });
  results.admin = sentAdmin.ok ? "sent" : sentAdmin.error;

  return NextResponse.json({ order_id: orderId, ...results });
}
