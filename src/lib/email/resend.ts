import "server-only";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export const isEmailConfigured = () =>
  Boolean(process.env.RESEND_API_KEY?.trim());

/** Захидал илгээгчийн хаяг. Домэйн Resend дээр баталгаажсан байх ёстой. */
export const EMAIL_FROM =
  process.env.EMAIL_FROM?.trim() || "LS Tech Store <noreply@lstechstore.com>";

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY тохируулаагүй" };

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return { ok: false, error: `${response.status} ${detail.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "тодорхойгүй алдаа",
    };
  }
}
