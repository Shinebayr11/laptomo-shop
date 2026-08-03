-- 6/6 · Захиалгын мэдэгдэл
-- notified_at нь давхар илгээхээс сэргийлнэ. Мэдэгдэл илгээх endpoint нь
-- энэ баганыг эхлээд эзэмшиж авдаг тул хоёр дуудлага зэрэг ирсэн ч нэг л
-- удаа явна.

alter table public.orders
  add column if not exists notified_at timestamptz;

create index if not exists orders_notified_at_idx
  on public.orders (notified_at)
  where notified_at is null;
