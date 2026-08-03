import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { isWireConfigured, retrieveWirePaymentIntent } from "@/lib/wire/server";
import { isWirePaymentComplete } from "@/lib/wire/types";
import {
  readPaymentIntentFromEvent,
  verifyWireSignature,
  WireEvent,
} from "@/lib/wire/webhook";

export const dynamic = "force-dynamic";

const SIGNATURE_HEADER = "WirePayment-Signature";

export async function POST(request: NextRequest) {
  const secret = process.env.WIRE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    // 5xx буцаавал Wire дахин илгээнэ — тохиргоо хийсний дараа event алдагдахгүй.
    return NextResponse.json(
      { error: "WIRE_WEBHOOK_SECRET тохируулаагүй байна." },
      { status: 503 },
    );
  }

  // HMAC нь ТҮҮХИЙ body дээр тооцогддог тул JSON.parse хийхээс өмнө текстээр авна.
  const rawBody = await request.text();

  const verification = verifyWireSignature({
    header: request.headers.get(SIGNATURE_HEADER),
    rawBody,
    secret,
  });

  if (!verification.valid) {
    // 400 буцаавал Wire дахин оролддоггүй — хуурамч хүсэлтийг дахин боловсруулахгүй.
    return NextResponse.json(
      { error: `Signature шалгалт амжилтгүй: ${verification.reason}` },
      { status: 400 },
    );
  }

  let event: WireEvent;
  try {
    event = JSON.parse(rawBody) as WireEvent;
  } catch {
    return NextResponse.json({ error: "JSON биш body." }, { status: 400 });
  }

  // Endpoint идэвхжүүлэх ping — 2xx хариулахад л хангалттай.
  if (event.type === "endpoint.verification") {
    return NextResponse.json({ received: true });
  }

  const intent = readPaymentIntentFromEvent(event);

  // Wire нь webhook-д зөвхөн id/amount/charge/object/status/currency илгээдэг —
  // metadata дотор байдаг order_id ирдэггүй. Тиймээс id-аар нь бүтэн
  // PaymentIntent-ийг татаж захиалгын дугаарыг авна.
  let orderId = intent.orderId;
  if (!orderId && intent.id && isWireConfigured()) {
    try {
      const full = await retrieveWirePaymentIntent(intent.id);
      const value = full.metadata?.order_id;
      if (typeof value === "string" && value) orderId = value;
    } catch {
      // Татаж чадаагүй ч event-ийг алдахгүйн тулд цааш үргэлжлүүлнэ.
    }
  }

  const supabase = createAdminSupabase();

  if (!supabase) {
    // Бүртгэж чадахгүй ч 200 буцаавал event үүрд алдагдана.
    // 503 буцаавал Wire дахин илгээх тул тохиргоо хийсний дараа сэргэнэ.
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY тохируулаагүй байна." },
      { status: 503 },
    );
  }

  // Event id нь primary key — Wire дахин илгээсэн ч давхардахгүй.
  const { error } = await supabase.from("payment_events").upsert(
    {
      id: event.id,
      type: event.type,
      payment_intent_id: intent.id,
      order_id: orderId,
      amount: intent.amount,
      succeeded: intent.status ? isWirePaymentComplete(intent.status) : false,
      payload: event as unknown as Record<string, unknown>,
    },
    // ignoreDuplicates: false — event дахин илгээхэд мөр шинэчлэгдэнэ.
    // Event id нь primary key тул давхар мөр үүсэхгүй, зөвхөн дарж бичнэ.
    { onConflict: "id", ignoreDuplicates: false },
  );

  if (error) {
    // Дахин илгээлгэхийн тулд 5xx.
    return NextResponse.json(
      { error: `Event хадгалж чадсангүй: ${error.message}` },
      { status: 500 },
    );
  }

  /**
   * Төлбөр амжилттай болсон бол захиалгыг энд үүсгэнэ. Ихэнх тохиолдолд
   * хэрэглэгч сайт руу буцаж ирээд аль хэдийн үүсгэсэн байна — тэр үед
   * place_order_for_user нь давхардуулахгүй (order id дээр ON CONFLICT).
   *
   * Энэ нь хэрэглэгч төлбөр төлөөд browser-ээ хаасан тохиолдлыг нөхнө.
   */
  if (orderId && intent.status && isWirePaymentComplete(intent.status)) {
    const { data: pending } = await supabase
      .from("pending_orders")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle();

    if (pending) {
      const { error: placeError } = await supabase.rpc(
        "place_order_for_user",
        {
          p_user_id: pending.user_id,
          p_order_id: pending.order_id,
          p_customer_name: pending.customer_name,
          p_customer_phone: pending.customer_phone,
          p_address: pending.address,
          p_items: pending.items,
          p_total_price: pending.total_price,
        },
      );

      if (placeError) {
        // 5xx буцаавал Wire дахин илгээнэ — дараагийн оролдлогод амжилттай
        // болох боломжтой (жишээ нь түр зуурын DB алдаа).
        return NextResponse.json(
          { error: `Захиалга үүсгэж чадсангүй: ${placeError.message}` },
          { status: 500 },
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
