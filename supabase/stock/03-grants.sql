-- 3/3 · Эрх олгох + нөөц сөрөг болохоос хамгаалах
-- Тайлбартай бүтэн хувилбар: supabase/stock-tracking.sql

revoke all on function public.place_order(text, text, text, text, jsonb, numeric) from public, anon;
revoke all on function public.set_order_status(text, order_status) from public, anon;

grant execute on function public.place_order(text, text, text, text, jsonb, numeric) to authenticated;
grant execute on function public.set_order_status(text, order_status) to authenticated;

do $add_stock_check$ begin
  alter table public.products add constraint products_stock_non_negative check (stock >= 0);
exception when duplicate_object then null; end $add_stock_check$;
