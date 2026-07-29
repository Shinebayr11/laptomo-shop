-- ============================================================
-- НӨӨЦИЙН ХЯНАЛТ
-- Supabase SQL Editor дотор бүхэлд нь тавиад Run дарна.
-- Дахин ажиллуулахад аюулгүй (idempotent).
-- ============================================================

-- Нөөц хасалт нь products хүснэгтэд бичих шаардлагатай ч RLS нь зөвхөн
-- админд бичих эрх өгдөг. Тиймээс security definer function ашиглана.
-- Ингэснээр хэрэглэгч нөөцийг дур мэдэн өөрчилж чадахгүй, зөвхөн энэ
-- функцээр дамжуулан захиалгын хэмжээгээр л хасагдана.

-- ------------------------------------------------------------
-- 1) Захиалга үүсгэх + нөөц хасах (нэг transaction)
-- ------------------------------------------------------------
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

  -- Захиалгыг ЭХЛЭЭД бичнэ. Ингэснээр ижил order_id-тай хоёр хүсэлт зэрэг
  -- ирэхэд нэг нь л амжилттай болж, нөөц давхар хасагдахгүй.
  -- (Эхлээд "байгаа эсэх"-ийг шалгаад дараа нь бичих нь race condition үүсгэдэг.)
  insert into public.orders (
    id, user_id, customer_name, customer_phone, address, items, total_price, status
  ) values (
    p_order_id, v_uid, p_customer_name, p_customer_phone, p_address,
    p_items, p_total_price, 'pending'
  )
  on conflict (id) do nothing
  returning * into v_order;

  -- Мөр буцаагүй бол захиалга аль хэдийн үүссэн байна — нөөцийг дахин хасахгүй.
  if v_order.id is null then
    select * into v_order from public.orders where id = p_order_id;
    return v_order;
  end if;

  -- Нөөц хүрэлцэхгүй бол доорх raise нь бүх transaction-ийг буцаана:
  -- дээр оруулсан захиалгын мөр ч мөн адил устана.
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

    -- DB-д мөр байхгүй бол (зөвхөн кодын seed дотор байгаа бараа) нөөц хянах
    -- боломжгүй тул алгасна. Бүх барааг DB-д оруулбал энэ салбар ажиллахаа болино.
    if v_title is null then
      continue;
    end if;

    v_expected := v_expected + v_unit_price * v_quantity;

    -- Мөрийг түгжиж, нөөц хүрэлцэж байвал л хасна.
    -- Зэрэг ирсэн хоёр захиалгын хоёр дахь нь шинэчлэгдсэн утга дээр дахин
    -- шалгагдана — ингэснээр илүү зарагдах (oversell) эрсдэлгүй.
    update public.products
       set stock = stock - v_quantity
     where id = v_product_id
       and is_archived = false
       and stock >= v_quantity;

    if not found then
      raise exception '% — үлдэгдэл хүрэлцэхгүй байна', v_title;
    end if;
  end loop;

  -- Үнийг browser-ээс хуурахаас сэргийлнэ. Хүргэлтийн хураамж зөвхөн нэмэгддэг
  -- тул захиалгын дүн барааны нийлбэрээс бага байж болохгүй.
  if p_total_price < v_expected then
    raise exception 'Захиалгын дүн буруу байна';
  end if;

  return v_order;
end;
$place_order$;

-- ------------------------------------------------------------
-- 2) Захиалгын төлөв солих + нөөц буцаах
-- ------------------------------------------------------------
create or replace function public.set_order_status(
  p_order_id text,
  p_status order_status
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $set_order_status$
declare
  v_order public.orders;
  v_item jsonb;
  v_product_id text;
  v_quantity int;
  v_title text;
begin
  if not public.is_admin() then
    raise exception 'Зөвхөн админ захиалгын төлөв өөрчилнө';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Захиалга олдсонгүй';
  end if;

  if v_order.status = p_status then
    return v_order;
  end if;

  -- Цуцлахад нөөц буцаж нэмэгдэнэ.
  if p_status = 'cancelled' then
    for v_item in select value from jsonb_array_elements(v_order.items)
    loop
      update public.products
         set stock = stock + coalesce((v_item->>'quantity')::int, 0)
       where id = v_item->>'product_id';
    end loop;

  -- Цуцалснаас буцааж идэвхжүүлэхэд нөөц дахин хасагдана.
  elsif v_order.status = 'cancelled' then
    for v_item in select value from jsonb_array_elements(v_order.items)
    loop
      v_product_id := v_item->>'product_id';
      v_quantity := coalesce((v_item->>'quantity')::int, 0);

      select title into v_title from public.products where id = v_product_id;
      if v_title is null then
        continue;
      end if;

      update public.products
         set stock = stock - v_quantity
       where id = v_product_id
         and stock >= v_quantity;

      if not found then
        raise exception '% — нөөц хүрэлцэхгүй тул захиалгыг сэргээх боломжгүй', v_title;
      end if;
    end loop;
  end if;

  update public.orders
     set status = p_status
   where id = p_order_id
  returning * into v_order;

  return v_order;
end;
$set_order_status$;

-- ------------------------------------------------------------
-- 3) Эрх олгох
-- ------------------------------------------------------------
revoke all on function public.place_order(text, text, text, text, jsonb, numeric) from public, anon;
revoke all on function public.set_order_status(text, order_status) from public, anon;

grant execute on function public.place_order(text, text, text, text, jsonb, numeric) to authenticated;
grant execute on function public.set_order_status(text, order_status) to authenticated;

-- ------------------------------------------------------------
-- 4) Нөөц сөрөг болохоос хамгаалах (schema-д аль хэдийн байгаа ч баталгаажуулна)
-- ------------------------------------------------------------
do $add_stock_check$ begin
  alter table public.products add constraint products_stock_non_negative check (stock >= 0);
exception when duplicate_object then null; end $add_stock_check$;
