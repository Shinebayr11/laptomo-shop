-- 1/3 · Захиалга үүсгэх + нөөц хасах
-- Тайлбартай бүтэн хувилбар: supabase/stock-tracking.sql

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
declare
  v_uid uuid := auth.uid();
  v_item jsonb;
  v_product_id text;
  v_quantity int;
  v_title text;
  v_unit_price numeric;
  v_expected numeric := 0;
  v_order public.orders;
begin
  if v_uid is null then
    raise exception 'Нэвтрээгүй байна';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'Захиалгын бараа хоосон байна';
  end if;

  insert into public.orders (
    id, user_id, customer_name, customer_phone, address, items, total_price, status
  ) values (
    p_order_id, v_uid, p_customer_name, p_customer_phone, p_address,
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

  return v_order;
end;
$place_order$;
