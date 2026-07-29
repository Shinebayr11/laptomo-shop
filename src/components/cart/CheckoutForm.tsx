"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, RefreshCw, ShieldCheck } from "lucide-react";
import { CartLine, Order, OrderItem } from "@/types";
import { WireCheckoutResponse } from "@/lib/wire/types";
import { useCart } from "@/store/CartContext";
import { useOrders } from "@/store/OrdersContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { OrderTracker } from "@/components/order/OrderTracker";
import { cn, effectivePrice, deliveryFee, formatMNT } from "@/utils/format";

const PAYMENTS = [
  { id: "wire", label: "Wire (QPay / банкны апп)" },
  { id: "cash", label: "Бэлэн (хүргэлтээр)" },
];

type CheckoutValues = {
  name: string;
  phone: string;
  address: string;
};

/**
 * Банкны апп руу шилжихээс өмнө захиалгын бүх мэдээллийг хадгална.
 * Буцаж ирэхэд сагс дахин ачаалагдаж амжаагүй байдаг тул бараануудыг
 * энд хуулбарлаж авах ёстой — эс бөгөөс захиалга хоосон бараатай үүснэ.
 */
type PendingWireCheckout = {
  intent_id: string;
  order_id: string;
  idempotency_key: string;
  customer: CheckoutValues;
  items: OrderItem[];
  user_id: string;
  created_at: number;
};

type WirePendingState = {
  intentId: string;
  status: string;
  actionUrl: string | null;
};

const PENDING_WIRE_KEY = "laptomo_pending_wire_checkout";
/** Хадгалсан төлбөрийн мэдээлэл хүчинтэй байх хугацаа. */
const PENDING_WIRE_TTL_MS = 24 * 60 * 60 * 1000;
/** Банкнаас буцаж ирэхэд төлөв шалгах давталт. */
const POLL_ATTEMPTS = 5;
const POLL_DELAY_MS = 3000;

function cartToOrderItems(lines: CartLine[]): OrderItem[] {
  return lines.map((line) => ({
    product_id: line.product.id,
    title: line.product.title,
    price: effectivePrice(line.product.price, line.product.discount_price),
    quantity: line.quantity,
    image: line.product.images[0] ?? "",
  }));
}

/**
 * localStorage ашигласан шалтгаан: QPay / банкны апп нь буцахдаа шинэ tab
 * нээж болзошгүй бөгөөд sessionStorage тухайн tab-тайгаа хамт алга болдог.
 */
function savePendingWireCheckout(pending: PendingWireCheckout) {
  try {
    localStorage.setItem(PENDING_WIRE_KEY, JSON.stringify(pending));
  } catch {
    /* алгасна */
  }
}

function clearPendingWireCheckout() {
  try {
    localStorage.removeItem(PENDING_WIRE_KEY);
    sessionStorage.removeItem(PENDING_WIRE_KEY);
  } catch {
    /* алгасна */
  }
}

function readPendingWireCheckout(): PendingWireCheckout | null {
  try {
    const value =
      localStorage.getItem(PENDING_WIRE_KEY) ??
      // Хуучин хувилбарт sessionStorage ашиглаж байсан.
      sessionStorage.getItem(PENDING_WIRE_KEY);
    if (!value) return null;

    const pending = JSON.parse(value) as PendingWireCheckout;
    if (
      pending.created_at &&
      Date.now() - pending.created_at > PENDING_WIRE_TTL_MS
    ) {
      clearPendingWireCheckout();
      return null;
    }
    return pending;
  } catch {
    return null;
  }
}

async function readApiError(response: Response): Promise<string> {
  const payload = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  return payload?.error || "Төлбөрийн хүсэлт амжилтгүй боллоо.";
}

export function CheckoutForm({ onComplete }: { onComplete?: () => void }) {
  const { lines, subtotal, clear } = useCart();
  const { placeOrder } = useOrders();
  const { user, ready: authReady } = useAuth();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [pay, setPay] = useState("wire");
  const [placed, setPlaced] = useState<Order | null>(null);
  const [wirePending, setWirePending] = useState<WirePendingState | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const checkedReturn = useRef(false);
  const nameEdited = useRef(false);
  const unmounted = useRef(false);

  useEffect(() => {
    unmounted.current = false;
    return () => {
      unmounted.current = true;
    };
  }, []);

  /**
   * user нь localStorage-оос effect дотор уншигддаг тул эхний render-т үргэлж
   * null байна. Тиймээс нэрийг useState-ийн анхны утгаар биш, ачаалагдсаны
   * дараа бөглөнө (хэрэглэгч гараар засаагүй тохиолдолд).
   */
  useEffect(() => {
    if (nameEdited.current || !user?.name) return;
    setForm((f) => (f.name ? f : { ...f, name: user.name }));
  }, [user?.name]);

  const valid = form.name && form.phone.length >= 8 && form.address;
  const set = (k: string, v: string) => {
    if (k === "name") nameEdited.current = true;
    setForm((f) => ({ ...f, [k]: v }));
  };

  /**
   * items болон userId-г параметрээр авдаг — банкнаас буцаж ирэхэд сагс хоосон
   * байдаг тул closure дотор баригдсан `lines`-д найдаж болохгүй.
   */
  const completeOrder = useCallback(
    async (
      customer: CheckoutValues,
      orderId: string | undefined,
      totalPrice: number,
      items: OrderItem[],
      userId: string,
    ) => {
      const order = await placeOrder({
        order_id: orderId,
        user_id: userId,
        customer_name: customer.name,
        customer_phone: customer.phone,
        address: customer.address,
        total_price: totalPrice,
        items,
      });

      clearPendingWireCheckout();
      window.history.replaceState(null, "", "/checkout");
      setPlaced(order);
      setWirePending(null);
      onComplete?.();
      clear();
    },
    [clear, onComplete, placeOrder],
  );

  /**
   * Төлбөрийн төлвийг шалгана. Банк баталгаажуулахад хэдэн секунд зарцуулдаг
   * тул `attempts` удаа давтан шалгаж, хэрэглэгчийг гараар товч дарахыг
   * хүлээлгэхгүй.
   */
  const verifyWirePayment = useCallback(
    async (
      intentId: string,
      pending: PendingWireCheckout,
      attempts = 1,
    ): Promise<void> => {
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        if (attempt > 0) {
          await new Promise((resolve) =>
            window.setTimeout(resolve, POLL_DELAY_MS),
          );
          if (unmounted.current) return;
        }

        const response = await fetch(
          `/api/wire/payment-intents/${encodeURIComponent(intentId)}`,
          { cache: "no-store" },
        );
        if (!response.ok) throw new Error(await readApiError(response));

        const result = (await response.json()) as Omit<
          WireCheckoutResponse,
          "order_id"
        >;
        if (unmounted.current) return;

        if (result.complete) {
          await completeOrder(
            pending.customer,
            pending.order_id,
            result.payment_intent.amount,
            pending.items,
            pending.user_id,
          );
          return;
        }

        setWirePending({
          intentId,
          status: result.payment_intent.status,
          actionUrl: result.action_url,
        });

        if (result.failed) {
          clearPendingWireCheckout();
          setWirePending(null);
          throw new Error(
            "Төлбөр амжилтгүй болсон эсвэл цуцлагдсан байна. Захиалгаа дахин эхлүүлнэ үү.",
          );
        }
      }
    },
    [completeOrder],
  );

  useEffect(() => {
    if (checkedReturn.current) return;
    // authReady-г хүлээхгүй бол clear() зочны сагсыг цэвэрлэж,
    // хэрэглэгчийн сагс төлбөр төлсний дараа ч дүүрэн үлдэнэ.
    if (!authReady) return;

    const intentId = new URLSearchParams(window.location.search).get(
      "wire_payment_intent",
    );
    if (!intentId) return;

    checkedReturn.current = true;
    const pending = readPendingWireCheckout();
    if (!pending || pending.intent_id !== intentId) {
      setErr(
        "Төлбөрийн түр мэдээлэл олдсонгүй. Захиалга үүссэн эсэхийг «Миний захиалга» хэсгээс шалгана уу.",
      );
      return;
    }

    setBusy(true);
    setErr(null);
    verifyWirePayment(intentId, pending, POLL_ATTEMPTS)
      .catch((error: unknown) =>
        setErr(
          error instanceof Error
            ? error.message
            : "Төлбөрийн төлөв шалгахад алдаа гарлаа.",
        ),
      )
      .finally(() => {
        if (!unmounted.current) setBusy(false);
      });
  }, [authReady, verifyWirePayment]);

  const submit = async () => {
    if (!valid || busy) return;
    if (!user) {
      setErr("Захиалга өгөхийн тулд эхлээд бүртгэлдээ нэвтэрнэ үү.");
      return;
    }
    setBusy(true);
    setErr(null);
    // Сагсны хуулбарыг шилжихээс өмнө авна.
    const orderItems = cartToOrderItems(lines);
    try {
      if (pay === "cash") {
        await completeOrder(
          form,
          undefined,
          subtotal + deliveryFee(),
          orderItems,
          user.id,
        );
        return;
      }

      const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${crypto
        .randomUUID()
        .slice(0, 4)
        .toUpperCase()}`;
      const idempotencyKey = crypto.randomUUID();
      const response = await fetch("/api/wire/payment-intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          idempotency_key: idempotencyKey,
          customer: { name: form.name, phone: form.phone },
          items: lines.map((line) => ({
            product_id: line.product.id,
            quantity: line.quantity,
          })),
        }),
      });

      if (!response.ok) throw new Error(await readApiError(response));

      const result = (await response.json()) as WireCheckoutResponse;
      const pending: PendingWireCheckout = {
        intent_id: result.payment_intent.id,
        order_id: result.order_id,
        idempotency_key: idempotencyKey,
        customer: form,
        items: orderItems,
        user_id: user.id,
        created_at: Date.now(),
      };
      savePendingWireCheckout(pending);

      if (result.complete) {
        await completeOrder(
          form,
          result.order_id,
          result.payment_intent.amount,
          orderItems,
          user.id,
        );
        return;
      }

      if (result.failed) {
        clearPendingWireCheckout();
        throw new Error(
          "Төлбөрийн хүсэлт цуцлагдсан байна. Дахин оролдоно уу.",
        );
      }

      setWirePending({
        intentId: result.payment_intent.id,
        status: result.payment_intent.status,
        actionUrl: result.action_url,
      });

      if (result.action_url) {
        window.location.assign(result.action_url);
        return;
      }

      // Operator холбоос ирээгүй бол хэрэглэгч хаашаа ч явахгүй тул мэдэгдэнэ.
      setErr(
        "Банкны төлбөрийн холбоос ирсэнгүй. Wire dashboard дээрх operator тохиргоог шалгана уу.",
      );
    } catch (error) {
      setErr(
        error instanceof Error
          ? error.message
          : "Захиалга илгээхэд алдаа гарлаа. Дахин оролдоно уу.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (placed)
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-3 rounded-xl2 border border-line py-10 text-center">
          <CheckCircle2
            className="text-green-600"
            size={52}
            strokeWidth={1.5}
          />
          <h2 className="font-display text-2xl text-ink">
            Захиалга амжилттай!
          </h2>
          <p className="text-sm text-muted">
            Захиалгын дугаар:{" "}
            <span className="font-semibold text-ink">{placed.id}</span>
          </p>
          <p className="max-w-sm text-sm text-muted">
            Бид тантай удахгүй холбогдоно. LS Tech Store-г сонгосон танд баярлалаа.
          </p>
        </div>

        <div className="rounded-xl2 border border-line p-6">
          <h3 className="mb-5 font-display text-lg text-ink">Захиалгын явц</h3>
          <OrderTracker status={placed.status} />
        </div>

        <div className="rounded-xl2 border border-line p-6">
          <h3 className="mb-4 font-display text-lg text-ink">
            Захиалсан бараа
          </h3>
          <div className="space-y-3">
            {placed.items.map((it) => (
              <div
                key={it.product_id}
                className="flex items-start justify-between gap-4 text-sm"
              >
                <span className="min-w-0 text-ink">
                  {it.title} <span className="text-muted">× {it.quantity}</span>
                </span>
                <span className="shrink-0 text-right text-ink">
                  {formatMNT(it.price * it.quantity)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-line pt-3 font-semibold text-ink">
              <span>Нийт</span>
              <span>{formatMNT(placed.total_price)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {user && (
            <Link href="/account">
              <Button>Бүх захиалгаа харах</Button>
            </Link>
          )}
          <Link href="/products">
            <Button variant="outline">Үргэлжлүүлэн дэлгүүр хэсэх</Button>
          </Link>
        </div>
      </div>
    );

  return (
    <div className="space-y-5">
      <Field
        label="Нэр"
        value={form.name}
        onChange={(v) => set("name", v)}
        placeholder="Таны нэр"
      />
      <Field
        label="Утас"
        value={form.phone}
        onChange={(v) => set("phone", v)}
        placeholder="99XXXXXX"
      />
      <Field
        label="Хүргэлтийн хаяг"
        value={form.address}
        onChange={(v) => set("address", v)}
        placeholder="Дүүрэг, хороо, байр, тоот"
      />

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide2 text-ink">
          Төлбөрийн хэлбэр
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          {PAYMENTS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPay(p.id)}
              className={cn(
                "rounded-lg border px-3 py-3 text-sm transition-colors",
                pay === p.id
                  ? "border-accent text-accent"
                  : "border-line text-muted",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {!user && (
        <p className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-muted">
          Захиалга хадгалахын тулд{" "}
          <Link href="/login" className="text-accent hover:underline">
            бүртгэлдээ нэвтэрнэ үү
          </Link>{" "}
          .
        </p>
      )}

      {err && <p className="text-sm text-red-600">{err}</p>}

      {wirePending && (
        <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-accent" size={20} />
            <div className="min-w-0">
              <p className="font-medium text-ink">Wire төлбөр хүлээгдэж байна</p>
              <p className="mt-1 text-xs text-muted">
                Төлөв: {wirePending.status} · {wirePending.intentId}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {wirePending.actionUrl && (
              <Button
                type="button"
                size="sm"
                onClick={() => window.location.assign(wirePending.actionUrl!)}
              >
                <ExternalLink size={15} /> Төлбөр үргэлжлүүлэх
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={async () => {
                const pending = readPendingWireCheckout();
                if (!pending) {
                  setErr("Төлбөрийн түр мэдээлэл олдсонгүй.");
                  return;
                }
                setBusy(true);
                setErr(null);
                try {
                  await verifyWirePayment(wirePending.intentId, pending);
                } catch (error) {
                  setErr(
                    error instanceof Error
                      ? error.message
                      : "Төлбөрийн төлөв шалгахад алдаа гарлаа.",
                  );
                } finally {
                  if (!unmounted.current) setBusy(false);
                }
              }}
            >
              <RefreshCw size={15} /> Төлөв шалгах
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => {
                clearPendingWireCheckout();
                setWirePending(null);
                setErr(null);
              }}
            >
              Цуцлаад дахин эхлэх
            </Button>
          </div>
        </div>
      )}

      <Button
        onClick={submit}
        // Хүлээгдэж буй төлбөр байхад дахин дарвал хоёр дахь PaymentIntent
        // үүсч, давхар төлөлт үүсэх эрсдэлтэй.
        disabled={!valid || busy || !user || Boolean(wirePending)}
        size="lg"
        className="w-full"
      >
        {busy
          ? "Шалгаж байна..."
          : wirePending
            ? "Төлбөр хүлээгдэж байна"
            : pay === "wire"
              ? "Wire-ээр төлөх"
              : "Захиалга баталгаажуулах"}
      </Button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide2 text-ink">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-accent"
      />
    </div>
  );
}
