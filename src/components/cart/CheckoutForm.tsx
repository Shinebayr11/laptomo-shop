"use client";
import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Order } from "@/types";
import { useCart } from "@/store/CartContext";
import { useOrders } from "@/store/OrdersContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { OrderTracker } from "@/components/order/OrderTracker";
import { cn, effectivePrice, deliveryFee, formatMNT } from "@/utils/format";

const PAYMENTS = [
  { id: "qpay", label: "QPay" },
  { id: "socialpay", label: "SocialPay" },
  { id: "cash", label: "Бэлэн (хүргэлтээр)" },
];

export function CheckoutForm() {
  const { lines, subtotal, clear } = useCart();
  const { placeOrder } = useOrders();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: "",
    address: "",
  });
  const [pay, setPay] = useState("qpay");
  const [placed, setPlaced] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const valid = form.name && form.phone.length >= 8 && form.address;
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const order = await placeOrder({
        user_id: user?.id ?? "guest",
        customer_name: form.name,
        customer_phone: form.phone,
        address: form.address,
        total_price: subtotal + deliveryFee(subtotal),
        items: lines.map((l) => ({
          product_id: l.product.id,
          title: l.product.title,
          price: effectivePrice(l.product.price, l.product.discount_price),
          quantity: l.quantity,
          image: l.product.images[0] ?? "",
        })),
      });
      setPlaced(order);
      clear();
    } catch {
      setErr(
        "Захиалга илгээхэд алдаа гарлаа. Нэвтэрсэн эсэхээ шалгаад дахин оролдоно уу.",
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
                className="flex items-center justify-between text-sm"
              >
                <span className="text-ink">
                  {it.title} <span className="text-muted">× {it.quantity}</span>
                </span>
                <span className="text-ink">
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
        <div className="grid grid-cols-3 gap-3">
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
        <p className="text-xs text-muted">
          Зөвлөмж:{" "}
          <Link href="/login" className="text-accent hover:underline">
            нэвтэрснээр
          </Link>{" "}
          захиалгаа дараа нь хянах боломжтой.
        </p>
      )}

      {err && <p className="text-sm text-red-600">{err}</p>}

      <Button
        onClick={submit}
        disabled={!valid || busy}
        size="lg"
        className="w-full"
      >
        {busy ? "Илгээж байна..." : "Захиалга баталгаажуулах"}
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
