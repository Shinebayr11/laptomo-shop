-- 8/8 · Захиалгын имэйлийн recipient тус бүрийн delivery төлөв
-- 01-07 migration өмнө нь ажилласан production төсөл дээр нэг удаа ажиллуулна.

alter table public.orders
  add column if not exists customer_notified_at timestamptz;

alter table public.orders
  add column if not exists admin_notified_at timestamptz;
