-- 2/3 · Захиалгын төлөв солих + нөөц буцаах
-- Тайлбартай бүтэн хувилбар: supabase/stock-tracking.sql

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

  if p_status = 'cancelled' then
    for v_item in select value from jsonb_array_elements(v_order.items)
    loop
      update public.products
         set stock = stock + coalesce((v_item->>'quantity')::int, 0)
       where id = v_item->>'product_id';
    end loop;

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
