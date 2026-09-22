-- Ангиллыг админ панелаас удирдах боломж нэмнэ. public.categories хүснэгт
-- schema.sql-д аль хэдийн байгаа (slug, name, parent_slug) — энд зөвхөн
-- дэлгэрэнгүй мэдээлэл (description, image) нэмээд, кодонд хатуу бичигдсэн
-- одоогийн ангиллуудыг DB руу нэг удаа шилжүүлнэ.

alter table public.categories
  add column if not exists description text not null default '',
  add column if not exists image text not null default '';

insert into public.categories (slug, name, description, image, parent_slug) values
  ('triple', 'Гурвалсан дэлгэц', 'Лаптопыг гурван дэлгэцтэй болгох зөөврийн өргөтгөгч', 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=80', null),
  ('triple-14', '14 инч', '', '', 'triple'),
  ('triple-156', '15.6 инч', '', '', 'triple'),

  ('dual', 'Хос дэлгэц', 'Нэг талдаа нэмэлт дэлгэцтэй өргөтгөгч', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80', null),
  ('dual-14', '14 инч', '', '', 'dual'),
  ('dual-156', '15.6 инч', '', '', 'dual'),

  ('single', 'Зөөврийн монитор', 'Дангаар ашиглах FHD зөөврийн дэлгэц', 'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=1200&q=80', null),
  ('mon-14', '14 инч', '', '', 'single'),
  ('mon-133', '13.3 инч', '', '', 'single'),
  ('mon-156', '15.6 инч', '', '', 'single'),
  ('mon-16', '16 инч', '', '', 'single'),

  ('phone', 'Гар утасны хэрэгсэл', 'Кейс, цэнэглэгч, кабель, дэлгэц хамгаалагч, чихэвч', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80', null),
  ('ph-case', 'Кейс', '', '', 'phone'),
  ('ph-charger', 'Цэнэглэгч', '', '', 'phone'),
  ('ph-cable', 'Кабель', '', '', 'phone'),
  ('ph-display', 'Дэлгэц дамжуулагч', '', '', 'phone'),
  ('ph-camera', 'Зураг авалтын хэрэгсэл', '', '', 'phone'),
  ('ph-protector', 'Дэлгэц хамгаалагч', '', '', 'phone'),
  ('ph-earphone', 'Чихэвч', '', '', 'phone'),
  ('ph-other', 'Бусад', '', '', 'phone'),

  ('accessory', 'Дагалдах хэрэгсэл', 'Кабель, цэнэглэгч, тавиур, хадгалах гэр', 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1200&q=80', null),
  ('acc-charger', 'Цэнэглэгч', '', '', 'accessory'),
  ('acc-cable', 'Кабель / Адаптер', '', '', 'accessory'),
  ('acc-printer', 'Принтер', '', '', 'accessory'),
  ('acc-stand', 'Тавиур', '', '', 'accessory'),
  ('acc-case', 'Хадгалах гэр', '', '', 'accessory'),
  ('acc-other', 'Бусад', '', '', 'accessory')
on conflict (slug) do update set
  description = excluded.description,
  image = excluded.image;
