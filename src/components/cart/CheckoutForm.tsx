"use client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/store/CartContext";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/format";

const PAYMENTS = [
  { id: "qpay", label: "QPay" },
  { id: "socialpay", label: "SocialPay" },
  { id: "cash", label: "Бэлэн (хүргэлтээр)" },
];

export function CheckoutForm() {
  const { clear } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [pay, setPay] = useState("qpay");
  const [done, setDone] = useState(false);

  const valid = form.name && form.phone.length >= 8 && form.address;
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const placeOrder = () => {
    if (!valid) return;
    // Эндээс Supabase-руу захиалга бичих эсвэл QPay/SocialPay руу чиглүүлнэ
    setDone(true);
    clear();
  };

  if (done)
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl2 border border-line py-16 text-center">
        <CheckCircle2 className="text-green-600" size={56} strokeWidth={1.5} />
        <h2 className="font-display text-2xl text-ink">Захиалга амжилттай!</h2>
        <p className="max-w-sm text-sm text-muted">Бид тантай удахгүй холбогдоно. Laptomo-г сонгосон танд баярлалаа.</p>
      </div>
    );

  return (
    <div className="space-y-5">
      <Field label="Нэр" value={form.name} onChange={(v) => set("name", v)} placeholder="Таны нэр" />
      <Field label="Утас" value={form.phone} onChange={(v) => set("phone", v)} placeholder="99XXXXXX" />
      <Field label="Хүргэлтийн хаяг" value={form.address} onChange={(v) => set("address", v)} placeholder="Дүүрэг, хороо, байр, тоот" />

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide2 text-ink">Төлбөрийн хэлбэр</label>
        <div className="grid grid-cols-3 gap-3">
          {PAYMENTS.map((p) => (
            <button key={p.id} onClick={() => setPay(p.id)} className={cn("rounded-lg border px-3 py-3 text-sm transition-colors", pay === p.id ? "border-accent text-accent" : "border-line text-muted")}>{p.label}</button>
          ))}
        </div>
      </div>

      <Button onClick={placeOrder} disabled={!valid} size="lg" className="w-full">Захиалга баталгаажуулах</Button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide2 text-ink">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-accent" />
    </div>
  );
}
