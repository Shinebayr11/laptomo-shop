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
  complete: boolean;
}

const COMPLETE_STATUSES = new Set(["succeeded", "paid", "completed"]);

export function isWirePaymentComplete(status: string): boolean {
  return COMPLETE_STATUSES.has(status.toLowerCase());
}

export function findWireActionUrl(value: unknown): string | null {
  if (typeof value === "string") {
    return /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : null;
  }

  if (!value || typeof value !== "object") return null;

  const action = value as Record<string, unknown>;
  const preferredKeys = [
    "url",
    "redirect_url",
    "checkout_url",
    "deeplink",
    "deep_link",
  ];

  for (const key of preferredKeys) {
    const candidate = action[key];
    if (
      typeof candidate === "string" &&
      /^[a-z][a-z0-9+.-]*:\/\//i.test(candidate)
    ) {
      return candidate;
    }
  }

  for (const candidate of Object.values(action)) {
    const nestedUrl = findWireActionUrl(candidate);
    if (nestedUrl) return nestedUrl;
  }

  return null;
}
