-- Wire webhook-ийн event-үүдийг бүртгэх хүснэгт.
-- Зөвхөн server талаас (service_role) бичигдэнэ, админ уншина.

create table if not exists public.payment_events (
  id text primary key,
  type text not null,
  payment_intent_id text,
  order_id text,
  amount numeric,
  succeeded boolean not null default false,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.payment_events enable row level security;

create index if not exists payment_events_order_id_idx
  on public.payment_events (order_id);
create index if not exists payment_events_created_at_idx
  on public.payment_events (created_at desc);

do $payment_events_admin_read$ begin
  create policy "payment_events_admin_read" on public.payment_events
    for select using (public.is_admin());
exception when duplicate_object then null; end $payment_events_admin_read$;
