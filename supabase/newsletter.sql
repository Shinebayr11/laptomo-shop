-- Newsletter бүртгэл. Public policy зориуд байхгүй: зөвхөн server-side
-- service_role /api/newsletter endpoint-оор бичнэ.

create table if not exists public.newsletter_subscribers (
  email text primary key check (length(email) between 3 and 254),
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;
