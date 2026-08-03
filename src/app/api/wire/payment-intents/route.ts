import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/data";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  confirmWirePaymentIntent,
  createWirePaymentIntent,
  isWireConfigured,
  WireApiError,
} from "@/lib/wire/server";
import {
  findWireActionUrl,
  isWirePaymentComplete,
  isWirePaymentFailed,
  readWireQrAction,
  WireCheckoutResponse,
  WirePaymentIntent,
} from "@/lib/wire/types";
import { deliveryFee, effectivePrice } from "@/utils/format";

export const dynamic = "force-dynamic";

type CheckoutLine = {
  product_id?: unknown;
  quantity?: unknown;
};

type CheckoutBody = {
  items?: unknown;
  customer?: {
    name?: unknown;
    phone?: unknown;
    address?: unknown;
  };
  order_id?: unknown;
  idempotency_key?: unknown;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function clientPaymentIntent(intent: WirePaymentIntent) {
  return {
    id: intent.id,
    amount: intent.amount,
    currency: intent.currency,
    status: intent.status,
    selected_operator: intent.selected_operator,
    next_action: intent.next_action,
    expires_at: intent.expires_at,
  };
}

function validToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 8 &&
    value.length <= 160 &&
    /^[A-Za-z0-9:_-]+$/.test(value)
  );
}

export async function POST(request: NextRequest) {
  if (!isWireConfigured()) {
    return errorResponse(
      "Wire төлбөрийн тохиргоо хийгдээгүй байна. WIRE_API_KEY-г server environment-д нэмнэ үү.",
      503,
    );
  }

  // Захиалгыг хэн өгснийг мэдэх ёстой — төлбөр төлөөд буцаж ирээгүй үед
  // webhook нь энэ хэрэглэгчийн нэрээр захиалгыг үүсгэнэ.
  const {
    data: { user },
  } = await createServerSupabase()!.auth.getUser();
  if (!user) {
    return errorResponse("Захиалга өгөхийн тулд нэвтэрнэ үү.", 401);
  }

  const body = (await request.json().catch(() => null)) as CheckoutBody | null;
  if (!body || !Array.isArray(body.items) || body.items.length === 0) {
    return errorResponse("Сагсны мэдээлэл дутуу байна.", 400);
  }

  if (body.items.length > 50) {
    return errorResponse("Сагсанд хэт олон төрлийн бараа байна.", 400);
  }

  const name =
    typeof body.customer?.name === "string"
      ? body.customer.name.trim().slice(0, 120)
      : "";
  const phone =
    typeof body.customer?.phone === "string"
      ? body.customer.phone.replace(/\s+/g, "").slice(0, 24)
      : "";
  const address =
    typeof body.customer?.address === "string"
      ? body.customer.address.trim().slice(0, 400)
      : "";

  if (!name || phone.length < 8) {
    return errorResponse("Захиалагчийн нэр, утасны дугаар дутуу байна.", 400);
  }
  if (!address) {
    return errorResponse("Хүргэлтийн хаяг дутуу байна.", 400);
  }

  const requestedLines = body.items as CheckoutLine[];
  const quantities = new Map<string, number>();

  for (const line of requestedLines) {
    const productId =
      typeof line.product_id === "string" ? line.product_id.trim() : "";
    const quantity = Number(line.quantity);
    if (
      !productId ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 99
    ) {
      return errorResponse("Сагсны барааны мэдээлэл буруу байна.", 400);
    }
    quantities.set(productId, (quantities.get(productId) ?? 0) + quantity);
  }

  const products = await getProducts({ respectArchiveCookie: false });
  const productMap = new Map(products.map((product) => [product.id, product]));
  let subtotal = 0;

  for (const [productId, quantity] of Array.from(quantities.entries())) {
    const product = productMap.get(productId);
    if (!product || product.is_archived) {
      return errorResponse("Сагсны зарим бараа худалдаанд байхгүй байна.", 409);
    }
    if (product.stock < quantity) {
      return errorResponse(
        `${product.title} барааны үлдэгдэл хүрэлцэхгүй байна.`,
        409,
      );
    }
    subtotal += effectivePrice(product.price, product.discount_price) * quantity;
  }

  const amount = Math.round(subtotal + deliveryFee());
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return errorResponse("Төлбөрийн дүн буруу байна.", 400);
  }

  const orderId = validToken(body.order_id)
    ? body.order_id
    : `ORD-${Date.now().toString(36).toUpperCase()}-${randomUUID()
        .slice(0, 4)
        .toUpperCase()}`;
  const idempotencyKey = validToken(body.idempotency_key)
    ? body.idempotency_key
    : randomUUID();

  try {
    const created = await createWirePaymentIntent(
      {
        amount,
        metadata: {
          order_id: orderId,
          source: "ls-tech-store",
          item_count: Array.from(quantities.values()).reduce(
            (sum, quantity) => sum + quantity,
            0,
          ),
        },
      },
      idempotencyKey,
    );

    // Захиалгын мэдээллийг server талд хадгална. Хэрэглэгч төлбөр төлөөд
    // сайт руу буцаж ирээгүй ч webhook эндээс уншиж захиалгыг үүсгэнэ.
    // Хадгалж чадаагүй ч төлбөрийг зогсоохгүй — client буцаж ирвэл ажиллана.
    const admin = createAdminSupabase();
    if (admin) {
      const orderItems = Array.from(quantities.entries()).map(
        ([productId, quantity]) => {
          const product = productMap.get(productId)!;
          return {
            product_id: product.id,
            title: product.title,
            price: effectivePrice(product.price, product.discount_price),
            quantity,
            image: product.images[0] ?? "",
          };
        },
      );

      await admin.from("pending_orders").upsert(
        {
          order_id: orderId,
          user_id: user.id,
          payment_intent_id: created.id,
          customer_name: name,
          customer_phone: phone,
          address,
          items: orderItems,
          total_price: amount,
        },
        { onConflict: "order_id" },
      );
    }

    let intent = created;
    if (!isWirePaymentComplete(created.status)) {
      const returnUrl = new URL("/checkout", request.nextUrl.origin);
      returnUrl.searchParams.set("wire_payment_intent", created.id);
      returnUrl.searchParams.set("order_id", orderId);

      intent = await confirmWirePaymentIntent(
        created.id,
        returnUrl.toString(),
        `${idempotencyKey}:confirm`,
      );
    }

    const response: WireCheckoutResponse = {
      payment_intent: clientPaymentIntent(intent),
      order_id: orderId,
      action_url: findWireActionUrl(intent.next_action),
      qr: readWireQrAction(intent.next_action),
      complete: isWirePaymentComplete(intent.status),
      failed: isWirePaymentFailed(intent.status),
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof WireApiError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          request_id: error.requestId,
        },
        { status: error.status >= 400 && error.status < 600 ? error.status : 502 },
      );
    }

    return errorResponse("Wire төлбөр эхлүүлэхэд алдаа гарлаа.", 500);
  }
}
