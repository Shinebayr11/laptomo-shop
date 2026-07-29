import { NextRequest, NextResponse } from "next/server";
import {
  isWireConfigured,
  retrieveWirePaymentIntent,
  WireApiError,
} from "@/lib/wire/server";
import {
  findWireActionUrl,
  isWirePaymentComplete,
  isWirePaymentFailed,
  readWireQrAction,
  WireCheckoutResponse,
} from "@/lib/wire/types";

export const dynamic = "force-dynamic";

const VALID_INTENT_ID = /^[A-Za-z0-9_-]{3,160}$/;

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!isWireConfigured()) {
    return NextResponse.json(
      { error: "Wire төлбөрийн тохиргоо хийгдээгүй байна." },
      { status: 503 },
    );
  }

  if (!VALID_INTENT_ID.test(params.id)) {
    return NextResponse.json(
      { error: "Төлбөрийн хүсэлтийн дугаар буруу байна." },
      { status: 400 },
    );
  }

  try {
    const intent = await retrieveWirePaymentIntent(params.id);
    const response: Omit<WireCheckoutResponse, "order_id"> = {
      payment_intent: {
        id: intent.id,
        amount: intent.amount,
        currency: intent.currency,
        status: intent.status,
        selected_operator: intent.selected_operator,
        next_action: intent.next_action,
        expires_at: intent.expires_at,
      },
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

    return NextResponse.json(
      { error: "Төлбөрийн төлөв шалгахад алдаа гарлаа." },
      { status: 500 },
    );
  }
}
