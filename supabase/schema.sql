-- ============================================================
-- LAPTOMO — Supabase өгөгдлийн сангийн схем
-- Supabase SQL Editor дотор бүхэлд нь хуулж ажиллуулна.
-- ============================================================

-- UUID generator
create extension if not exists "pgcrypto";

-- ---------- ENUMS ----------
do $$ begin
  create type user_role as enum ('admin', 'customer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('pending','processing','shipped','delivered','cancelled');
exception when duplicate_object then null; end $$;

-- ---------- PROFILES (auth.users-тэй холбоотой) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null,
  role user_role not null default 'customer',
  created_at timestamptz not null default now()
);

-- ---------- CATEGORIES ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  parent_slug text,
  created_at timestamptz not null default now()
);

-- ---------- PRODUCTS ----------
create table if not exists public.products (
  id text primary key,
  title text not null,
  slug text unique not null,
  price numeric not null check (price >= 0),
  discount_price numeric,
  images jsonb not null default '[]'::jsonb,
  category text not null,
  subcategory text not null,
  brand text not null,
  description text not null default '',
  specifications jsonb not null default '[]'::jsonb,
  stock int not null default 0 check (stock >= 0),
  rating numeric not null default 0,
  reviews_count int not null default 0,
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_bestseller boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- ORDERS ----------
create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  address text not null,
  items jsonb not null default '[]'::jsonb,
  total_price numeric not null check (total_price >= 0),
  status order_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- ---------- REVIEWS ----------
create table if not exists public.reviews (
  id text primary key,
  product_id text references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  user_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null default '',
  images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ADMIN ШАЛГАХ ТУСЛАХ ФУНКЦ
-- ============================================================
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles   enable row level security;
alter table public.categories enable row level security;
alter table public.products   enable row level security;
alter table public.orders     enable row level security;
alter table public.reviews    enable row level security;

-- PROFILES: хэрэглэгч өөрийнхөө мэдээллийг харна, админ бүгдийг
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_self" on public.profiles for insert with check (auth.uid() = id);

-- CATEGORIES & PRODUCTS: нийтэд унших, зөвхөн админ бичих
create policy "categories_public_read" on public.categories for select using (true);
create policy "categories_admin_write" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "products_public_read" on public.products for select using (true);
create policy "products_admin_write" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- ORDERS: хэрэглэгч өөрийн захиалга, админ бүгд
create policy "orders_select_own" on public.orders for select using (auth.uid() = user_id or public.is_admin());
create policy "orders_insert_own" on public.orders for insert with check (auth.uid() = user_id);
create policy "orders_admin_update" on public.orders for update using (public.is_admin());

-- REVIEWS: нийтэд унших, хэрэглэгч өөрийнхөө сэтгэгдлийг удирдах, админ устгах
create policy "reviews_public_read" on public.reviews for select using (true);
create policy "reviews_insert_own" on public.reviews for insert with check (auth.uid() = user_id);
create policy "reviews_update_own" on public.reviews for update using (auth.uid() = user_id);
create policy "reviews_delete_own_or_admin" on public.reviews for delete using (auth.uid() = user_id or public.is_admin());

-- ============================================================
-- ШИНЭ ХЭРЭГЛЭГЧ БҮРТГЭХ TRIGGER (auth.users -> profiles)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, email, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'name',''), new.email, 'customer')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
