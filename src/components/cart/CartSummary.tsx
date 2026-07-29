import Link from "next/link";
import { deliveryFee, formatMNT } from "@/utils/format";
import { Button } from "@/components/ui/Button";

export function CartSummary({ subtotal, cta = true }: { subtotal: number; cta?: boolean }) {
  // Хүргэлтийн дүнг заавал deliveryFee()-ээр тооцно — энд давхардуулж бичвэл
  // сервер талын тооцоотой зөрж, дэлгэц дээр өөр дүн харагдана.
  const shipping = deliveryFee();
  return (
    <div className="rounded-xl2 border border-line bg-surface p-6">
      <h3 className="font-display text-xl text-ink">Захиалгын дүн</h3>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between"><dt className="text-muted">Барааны дүн</dt><dd className="text-ink">{formatMNT(subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-muted">Хүргэлт</dt><dd className="text-ink">{shipping ? formatMNT(shipping) : "Үнэгүй"}</dd></div>
        <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
          <dt className="text-ink">Нийт</dt><dd className="text-ink">{formatMNT(subtotal + shipping)}</dd>
        </div>
      </dl>
      {cta && (
        <Link href="/checkout"><Button className="mt-6 w-full">Захиалга өгөх</Button></Link>
      )}
    </div>
  );
}
