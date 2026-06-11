export const formatMNT = (value: number): string =>
  new Intl.NumberFormat("mn-MN").format(Math.round(value)) + "₮";

export const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));

export const discountPercent = (price: number, discount: number | null): number => {
  if (!discount || discount >= price) return 0;
  return Math.round(((price - discount) / price) * 100);
};

export const effectivePrice = (price: number, discount: number | null): number =>
  discount && discount < price ? discount : price;

export const cn = (...classes: (string | false | null | undefined)[]): string =>
  classes.filter(Boolean).join(" ");
