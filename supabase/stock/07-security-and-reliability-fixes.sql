-- 7/7 · Security болон reliability засварууд
-- Өмнөх 01-06 migration ажилласан production төсөл дээр үүнийг нэг удаа ажиллуулна.

-- Хэрэглэгч өөрийн role/email-ийг өөрчилж админ болохоос хамгаална.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

revoke update on public.profiles from authenticated;
grant update (name) on public.profiles to authenticated;

-- Notification илгээлтийн түр claim. Амжилтгүй илгээлт retry хийгдэнэ.
alter table public.orders
  add column if not exists notification_claimed_at timestamptz;

-- 05 migration-ийн функцийг шинэчлэн суулгаж order ownership болон
-- байхгүй product-ийн шалгалтыг идэвхжүүлнэ. Энэ файлын дараа
-- 05-pending-orders.sql-ийн шинэ хувилбарыг дахин ажиллуулна.
