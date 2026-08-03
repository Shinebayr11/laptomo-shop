-- 5/5 · Хүлээгдэж буй захиалга — төлбөр төлөөд буцаж ирээгүй тохиолдол
-- Тайлбартай бүтэн хувилбар: supabase/pending-orders.sql

create table if not exists public.pending_orders (
  order_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  payment_intent_id text,
  customer_name text not null,
  customer_phone text not null,
  address text not null,
  items jsonb not null,
  total_price numeric not null,
  created_at timestamptz not null default now()
);

alter table public.pending_orders enable row level security;

create index if not exists pending_orders_intent_idx
  on public.pending_orders (payment_intent_id);

create or replace function public.place_order_for_user(
  p_user_id uuid,
  p_order_id text,
  p_customer_name text,
  p_customer_phone text,
  p_address text,
  p_items jsonb,
  p_total_price numeric
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $place_order_for_user$
declare
  v_item jsonb;
  v_product_id text;
  v_quantity int;
  v_title text;
  v_unit_price numeric;
  v_expected numeric := 0;
  v_order public.orders;
begin
  if p_user_id is null then
    raise exception 'Хэрэглэгч тодорхойгүй байна';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'Захиалгын бараа хоосон байна';
  end if;

  insert into public.orders (
    id, user_id, customer_name, customer_phone, address, items, total_price, status
  ) values (
    p_order_id, p_user_id, p_customer_name, p_customer_phone, p_address,
    p_items, p_total_price, 'pending'
  )
  on conflict (id) do nothing
  returning * into v_order;

  if v_order.id is null then
    select * into v_order from public.orders where id = p_order_id;
    return v_order;
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := v_item->>'product_id';
    v_quantity := coalesce((v_item->>'quantity')::int, 0);

    if v_product_id is null or v_quantity < 1 then
      raise exception 'Барааны мэдээлэл буруу байна';
    end if;

    select title, case
             when discount_price is not null and discount_price < price
               then discount_price
             else price
           end
      into v_title, v_unit_price
      from public.products
     where id = v_product_id;

    if v_title is null then
      continue;
    end if;

    v_expected := v_expected + v_unit_price * v_quantity;

    update public.products
       set stock = stock - v_quantity
     where id = v_product_id
       and is_archived = false
       and stock >= v_quantity;

    if not found then
      raise exception '% — үлдэгдэл хүрэлцэхгүй байна', v_title;
    end if;
  end loop;

  if p_total_price < v_expected then
    raise exception 'Захиалгын дүн буруу байна';
  end if;

  delete from public.pending_orders where order_id = p_order_id;

  return v_order;
end;
$place_order_for_user$;

-- place_order одоо нэвтэрсэн эсэхийг шалгаад дээрх функц рүү дамжуулна.
-- Логик нэг газар байснаар client болон webhook хоёр ижилхэн ажиллана.
create or replace function public.place_order(
  p_order_id text,
  p_customer_name text,
  p_customer_phone text,
  p_address text,
  p_items jsonb,
  p_total_price numeric
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $place_order$
begin
  if auth.uid() is null then
    raise exception 'Нэвтрээгүй байна';
  end if;

  return public.place_order_for_user(
    auth.uid(), p_order_id, p_customer_name, p_customer_phone,
    p_address, p_items, p_total_price
  );
end;
$place_order$;

revoke all on function public.place_order_for_user(uuid, text, text, text, text, jsonb, numeric)
  from public, anon, authenticated;
grant execute on function public.place_order_for_user(uuid, text, text, text, text, jsonb, numeric)
  to service_role;

revoke all on function public.place_order(text, text, text, text, jsonb, numeric) from public, anon;
grant execute on function public.place_order(text, text, text, text, jsonb, numeric) to authenticated;
