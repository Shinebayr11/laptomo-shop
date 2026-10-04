-- Ангиллыг устгахгүйгээр дэлгүүрээс нууж, дараа нь сэргээх боломж.

alter table public.categories
  add column if not exists is_archived boolean not null default false;

create index if not exists categories_is_archived_idx
  on public.categories (is_archived);
