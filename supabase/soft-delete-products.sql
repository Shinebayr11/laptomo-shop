-- Run this once in Supabase SQL Editor for existing projects.
alter table public.products
  add column if not exists is_archived boolean not null default false;

update public.products
set is_archived = false
where is_archived is null;

alter table public.products
  alter column is_archived set default false,
  alter column is_archived set not null;

create index if not exists products_is_archived_idx
  on public.products (is_archived);
