export const formatMNT = (value: number): string =>
  new Intl.NumberFormat("mn-MN").format(Math.round(value)) + "₮";

export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  if (!iso || isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
};

export const discountPercent = (
  price: number,
  discount: number | null,
): number => {
  if (!discount || discount >= price) return 0;
  return Math.round(((price - discount) / price) * 100);
};

export const effectivePrice = (
  price: number,
  discount: number | null,
): number => (discount && discount < price ? discount : price);

/**
 * Хүргэлт бүх бараан дээр үнэгүй.
 * Дүн бүрийг энэ функцээр дамжуулдаг тул дараа хураамж нэвтрүүлэх бол
 * зөвхөн энд өөрчилнө — checkout, сагс, төлбөрийн API гурав нэг дор дагана.
 */
export const deliveryFee = (): number => 0;

export const cn = (...classes: (string | false | null | undefined)[]): string =>
  classes.filter(Boolean).join(" ");
