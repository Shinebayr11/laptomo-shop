export interface WirePaymentIntent {
  id: string;
  object: "payment_intent";
  amount: number;
  currency: "MNT";
  status: string;
  automatic_operator?: boolean;
  allowed_operators?: string[];
  selected_operator?: string | null;
  next_action?: unknown;
  livemode?: boolean;
  created?: number;
  expires_at?: number;
}

export interface WireCheckoutResponse {
  payment_intent: Pick<
    WirePaymentIntent,
    | "id"
    | "amount"
    | "currency"
    | "status"
    | "selected_operator"
    | "next_action"
    | "expires_at"
  >;
  order_id: string;
  action_url: string | null;
  qr: WireQrAction | null;
  complete: boolean;
  failed: boolean;
}

const COMPLETE_STATUSES = new Set(["succeeded", "paid", "completed"]);
/** Дахин хүлээх утгагүй, эцсийн бүтэлгүй төлөвүүд. */
const FAILED_STATUSES = new Set([
  "canceled",
  "cancelled",
  "failed",
  "expired",
  "declined",
  "voided",
]);

export function isWirePaymentComplete(status: string): boolean {
  return COMPLETE_STATUSES.has(status.toLowerCase());
}

export function isWirePaymentFailed(status: string): boolean {
  return FAILED_STATUSES.has(status.toLowerCase());
}

/** Банкны апп руу шилжүүлэх холбоос. */
export interface WireDeeplink {
  name: string;
  description: string | null;
  logo: string | null;
  link: string;
}

/** QPay маягийн QR төлбөр. */
export interface WireQrAction {
  image_url: string | null;
  text: string | null;
  deeplinks: WireDeeplink[];
}

const HTTP_URL = /^https?:\/\//i;

/**
 * Хөтчийг шилжүүлэх http(s) холбоосыг олно.
 *
 * Зөвхөн нэр нь мэдэгдэж буй түлхүүрээс уншина. Өмнө нь дурын утгыг
 * дүүжлэн хайдаг байсан тул QPay-ийн deeplink доторх `logo` (банкны лого
 * зураг) сонгогдож, төлбөрийн хуудасны оронд зураг нээгддэг байсан.
 */
export function findWireActionUrl(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;

  const action = value as Record<string, unknown>;
  for (const key of ["url", "redirect_url", "checkout_url"]) {
    const candidate = action[key];
    if (typeof candidate === "string" && HTTP_URL.test(candidate)) {
      return candidate;
    }
  }

  for (const nested of Object.values(action)) {
    if (nested && typeof nested === "object") {
      const found = findWireActionUrl(nested);
      if (found) return found;
    }
  }

  return null;
}

/** QR төлбөрийн мэдээллийг гаргаж авна. Байхгүй бол null. */
export function readWireQrAction(value: unknown): WireQrAction | null {
  if (!value || typeof value !== "object") return null;

  const action = value as Record<string, unknown>;
  const qr = (action.qr ?? action) as Record<string, unknown>;

  const imageUrl = typeof qr.image_url === "string" ? qr.image_url : null;
  const text = typeof qr.text === "string" ? qr.text : null;

  const rawLinks = Array.isArray(qr.deeplinks) ? qr.deeplinks : [];
  const deeplinks: WireDeeplink[] = [];
  for (const item of rawLinks) {
    if (!item || typeof item !== "object") continue;
    const entry = item as Record<string, unknown>;
    if (typeof entry.link !== "string" || !entry.link) continue;
    deeplinks.push({
      name: typeof entry.name === "string" ? entry.name : "Банк",
      description:
        typeof entry.description === "string" ? entry.description : null,
      logo: typeof entry.logo === "string" ? entry.logo : null,
      link: entry.link,
    });
  }

  if (!imageUrl && !text && !deeplinks.length) return null;
  return { image_url: imageUrl, text, deeplinks };
}
