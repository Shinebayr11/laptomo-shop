-- Ангиллын дэлгэрэнгүй мэдээллийг DB-д хадгалах талбарууд.
-- Ангиллын бодит мөрүүдийг Admin самбараас үүсгэнэ.

alter table public.categories
  add column if not exists description text not null default '',
  add column if not exists image text not null default '';
