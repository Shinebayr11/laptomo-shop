-- Brand-гүй бүтээгдэхүүнийг хоосон утгаар хадгална.
-- Product form шинэ брэндийн нэрийг шууд хүлээн авдаг тул тусдаа хүснэгт хэрэггүй.
update public.products
set brand = ''
where brand is null;

alter table public.products
  alter column brand set default '',
  alter column brand set not null;
