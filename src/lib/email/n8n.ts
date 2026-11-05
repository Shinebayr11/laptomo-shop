import "server-only";
import { Order } from "@/types";

export const isN8nOrderWebhookConfigured = () =>
  Boolean(
    process.env.N8N_ORDER_WEBHOOK_URL?.trim() &&
      process.env.N8N_ORDER_WEBHOOK_SECRET?.trim(),
  );

export async function sendOrderToN8n(input: {
  order: Order;
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const url = process.env.N8N_ORDER_WEBHOOK_URL?.trim();
  const secret = process.env.N8N_ORDER_WEBHOOK_SECRET?.trim();
  if (!url || !secret) {
    return {
      ok: false,
      error: "N8N_ORDER_WEBHOOK_URL/SECRET тохируулаагүй",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: "order.created",
        idempotency_key: input.order.id,
        to: input.to,
        subject: input.subject,
        html: input.html,
        order: {
          id: input.order.id,
          customer_name: input.order.customer_name,
          customer_phone: input.order.customer_phone,
          address: input.order.address,
          items: input.order.items,
          total_price: input.order.total_price,
          status: input.order.status,
          created_at: input.order.created_at,
        },
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return {
        ok: false,
        error: `${response.status} ${detail.slice(0, 200)}`.trim(),
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "n8n webhook алдаатай",
    };
  } finally {
    clearTimeout(timeout);
  }
}
