-- 6/6 · Захиалгын мэдэгдэл
-- notification_claimed_at нь зэрэг ирсэн дуудлагуудаас нэгийг нь түр
-- эзэмшүүлнэ. Илгээлт бүтэлгүйтвэл claim цэвэрлэгдэж retry хийх боломжтой.

alter table public.orders
  add column if not exists notified_at timestamptz;

alter table public.orders
  add column if not exists notification_claimed_at timestamptz;

-- Хоёр хүлээн авагчийн аль нэг амжилтгүй болсон үед амжилттай илгээгдсэн
-- имэйлийг retry дээр дахин явуулахгүй байхын тулд тусад нь тэмдэглэнэ.
alter table public.orders
  add column if not exists customer_notified_at timestamptz;

alter table public.orders
  add column if not exists admin_notified_at timestamptz;

create index if not exists orders_notified_at_idx
  on public.orders (notified_at)
  where notified_at is null;
