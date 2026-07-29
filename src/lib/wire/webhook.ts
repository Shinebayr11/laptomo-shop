import crypto from "crypto";

/**
 * Wire webhook-ийн гарын үсэг шалгах.
 *
 * Толгой: `WirePayment-Signature: t=<unix>,v1=<hex>`
 * Гарын үсэг: HMAC-SHA256(secret, `${t}.${rawBody}`)
 * 5 минутаас хуучин `t`-г татгалзана (replay халдлагаас хамгаална).
 */

/** Гарын үсэг хүчинтэй байх дээд хугацаа (секунд). */
export const WIRE_SIGNATURE_TOLERANCE_SEC = 300;

export type WireSignatureResult =
  | { valid: true }
  | { valid: false; reason: string };

type ParsedSignature = { timestamp: number; signature: string };

/** `t=1717570000,v1=abc...` хэлбэрийг задална. */
export function parseWireSignatureHeader(
  header: string | null,
): ParsedSignature | null {
  if (!header) return null;

  let timestamp: number | null = null;
  let signature: string | null = null;

  for (const part of header.split(",")) {
    const index = part.indexOf("=");
    if (index === -1) continue;

    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();

    if (key === "t") {
      // Зөвхөн бүхэл тоо. parseInt нь "12abc"-г 12 гэж уншдаг тул шууд шалгана.
      if (!/^\d+$/.test(value)) return null;
      timestamp = Number(value);
    } else if (key === "v1") {
      if (!/^[0-9a-f]+$/i.test(value)) return null;
      signature = value.toLowerCase();
    }
  }

  if (timestamp === null || signature === null) return null;
  return { timestamp, signature };
}

/** Урт нь ижил үед л timing-safe харьцуулна. */
function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

export function verifyWireSignature({
  header,
  rawBody,
  secret,
  nowSec = Math.floor(Date.now() / 1000),
  toleranceSec = WIRE_SIGNATURE_TOLERANCE_SEC,
}: {
  header: string | null;
  rawBody: string;
  secret: string;
  nowSec?: number;
  toleranceSec?: number;
}): WireSignatureResult {
  if (!secret) {
    return { valid: false, reason: "signing secret тохируулаагүй" };
  }

  const parsed = parseWireSignatureHeader(header);
  if (!parsed) {
    return { valid: false, reason: "WirePayment-Signature толгой буруу" };
  }

  // Ирээдүйн timestamp-ийг мөн татгалзана (цагийн зөрүү эсвэл хуурамч).
  const age = nowSec - parsed.timestamp;
  if (Math.abs(age) > toleranceSec) {
    return { valid: false, reason: `timestamp хуучирсан (${age}с)` };
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${parsed.timestamp}.${rawBody}`)
    .digest("hex");

  if (!safeEqualHex(expected, parsed.signature)) {
    return { valid: false, reason: "гарын үсэг таарахгүй" };
  }

  return { valid: true };
}

/** Туршилт болон дотоод хэрэглээнд — Wire-ийн илгээх толгойг үүсгэнэ. */
export function buildWireSignatureHeader(
  rawBody: string,
  secret: string,
  timestamp = Math.floor(Date.now() / 1000),
): string {
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
  return `t=${timestamp},v1=${signature}`;
}

export interface WireEvent {
  id: string;
  object: "event";
  type: string;
  api_version?: string;
  data?: unknown;
  livemode?: boolean;
  created?: number;
}

/** Event-ийн доторх PaymentIntent-ийн талбаруудыг гаргаж авна. */
export function readPaymentIntentFromEvent(event: WireEvent): {
  id: string | null;
  orderId: string | null;
  amount: number | null;
  status: string | null;
} {
  const data = event.data as Record<string, unknown> | undefined;
  // `data` нь шууд объект эсвэл Stripe маягийн { object: {...} } байж болно.
  const nested = data?.object as Record<string, unknown> | undefined;
  const intent = (nested && typeof nested === "object" ? nested : data) ?? {};

  const metadata = intent.metadata as Record<string, unknown> | undefined;
  const orderId =
    typeof metadata?.order_id === "string" ? metadata.order_id : null;

  return {
    id: typeof intent.id === "string" ? intent.id : null,
    orderId,
    amount: typeof intent.amount === "number" ? intent.amount : null,
    status: typeof intent.status === "string" ? intent.status : null,
  };
}
