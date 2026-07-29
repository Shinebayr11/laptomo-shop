import "server-only";
import { WirePaymentIntent } from "./types";

const DEFAULT_BASE_URL = "https://api.wire.mn";

type WireErrorBody = {
  error?: {
    type?: string;
    code?: string;
    message?: string;
    param?: string;
    request_id?: string;
  };
};

export class WireApiError extends Error {
  status: number;
  code?: string;
  requestId?: string;

  constructor(
    message: string,
    status: number,
    code?: string,
    requestId?: string,
  ) {
    super(message);
    this.name = "WireApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

export function isWireConfigured(): boolean {
  return Boolean(process.env.WIRE_API_KEY?.trim());
}

async function wireRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST";
    body?: Record<string, unknown>;
    idempotencyKey?: string;
  } = {},
): Promise<T> {
  const apiKey = process.env.WIRE_API_KEY?.trim();
  if (!apiKey) {
    throw new WireApiError(
      "Wire төлбөрийн API key тохируулагдаагүй байна.",
      503,
      "wire_not_configured",
    );
  }

  const baseUrl = (process.env.WIRE_API_BASE_URL || DEFAULT_BASE_URL).replace(
    /\/+$/,
    "",
  );
  const headers = new Headers({
    Accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
  });

  if (options.body) headers.set("Content-Type", "application/json");
  if (options.idempotencyKey) {
    headers.set("Idempotency-Key", options.idempotencyKey);
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new WireApiError(
      "Wire төлбөрийн сервертэй холбогдож чадсангүй.",
      502,
      "wire_unreachable",
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | T
    | WireErrorBody
    | null;

  if (!response.ok) {
    const wireError = (payload as WireErrorBody | null)?.error;
    throw new WireApiError(
      wireError?.message || "Wire төлбөрийн хүсэлт амжилтгүй боллоо.",
      response.status,
      wireError?.code,
      wireError?.request_id,
    );
  }

  return payload as T;
}

export function createWirePaymentIntent(
  input: {
    amount: number;
    metadata: Record<string, string | number | boolean>;
  },
  idempotencyKey: string,
): Promise<WirePaymentIntent> {
  const allowedOperators = (process.env.WIRE_ALLOWED_OPERATORS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return wireRequest<WirePaymentIntent>("/v1/payment_intents", {
    method: "POST",
    idempotencyKey,
    body: {
      amount: input.amount,
      currency: "MNT",
      automatic_operator: true,
      allowed_operators: allowedOperators,
      metadata: input.metadata,
    },
  });
}

export function confirmWirePaymentIntent(
  id: string,
  returnUrl: string,
  idempotencyKey: string,
): Promise<WirePaymentIntent> {
  const operator = process.env.WIRE_OPERATOR?.trim();

  return wireRequest<WirePaymentIntent>(
    `/v1/payment_intents/${encodeURIComponent(id)}/confirm`,
    {
      method: "POST",
      idempotencyKey,
      body: {
        ...(operator ? { operator } : {}),
        return_url: returnUrl,
      },
    },
  );
}

export function retrieveWirePaymentIntent(
  id: string,
): Promise<WirePaymentIntent> {
  return wireRequest<WirePaymentIntent>(
    `/v1/payment_intents/${encodeURIComponent(id)}`,
  );
}
