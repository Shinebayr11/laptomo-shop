-- ============================================================
-- Кодын seed дотор байгаа ч DB-д байхгүй бараануудыг оруулна.
-- Нөөц хянагдахын тулд бараа бүр DB-д мөртэй байх ёстой.
-- on conflict do nothing — одоо байгаа мөрүүдийг огт хөндөхгүй
-- (архивласан төлөв нь хэвээр үлдэнэ).
-- ============================================================

insert into public.products (
  id, title, slug, price, discount_price, images, category, subcategory,
  brand, description, specifications, stock, rating, reviews_count,
  is_featured, is_new, is_bestseller, is_archived, created_at
) values (
  'p-022', '14 инч Triple Portable Monitor', '14-triple-portable-monitor', 1699000, 1499000,
  '["/products/laptomo-baraa2/hq/triple-monitor-14-front.png","/products/laptomo-baraa2/hq/triple-monitor-14-color-angle.png","/products/laptomo-baraa2/hq/triple-monitor-14-back.png"]'::jsonb, 'triple', 'triple-14',
  'LS Tech', '14 инчийн гурвалсан зөөврийн дэлгэц. Лаптоп дээр хоёр нэмэлт дэлгэц нэмж, ажлын талбайгаа богино хугацаанд өргөтгөнө.',
  '[{"label":"Дэлгэц","value":"14\" × 2 нэмэлт дэлгэц"},{"label":"Нягтрал","value":"FHD 1080P"},{"label":"Панель","value":"IPS, 16:9"},{"label":"Ажиллагаа","value":"Plug & Play"}]'::jsonb, 8, 4.8, 18,
  true, true, true, false, '2026-07-10T09:25:00Z'
) on conflict (id) do nothing;

insert into public.products (
  id, title, slug, price, discount_price, images, category, subcategory,
  brand, description, specifications, stock, rating, reviews_count,
  is_featured, is_new, is_bestseller, is_archived, created_at
) values (
  'p-023', '15.6 инч Dual Portable Monitor', '15-6-dual-portable-monitor', 1299000, 1167000,
  '["/products/laptomo-baraa2/hq/dual-portable-monitor-156-main.png","/products/laptomo-baraa2/hq/dual-portable-monitor-156-angle.png","/products/laptomo-baraa2/hq/dual-portable-monitor-156-detail.png"]'::jsonb, 'dual', 'dual-156',
  'LS Tech', '15.6 инчийн босоо байрлалтай dual portable monitor. Хоёр дэлгэцийг нэг төхөөрөмжөөр ашиглаж, код бичих, chat, document зэрэг олон цонхтой ажиллахад тохиромжтой.',
  '[{"label":"Дэлгэц","value":"15.6\" dual display"},{"label":"Нягтрал","value":"FHD 1080P"},{"label":"Панель","value":"IPS, 16:9"},{"label":"Холболт","value":"USB-C / HDMI"}]'::jsonb, 7, 4.7, 15,
  true, true, false, false, '2026-07-10T09:30:00Z'
) on conflict (id) do nothing;

insert into public.products (
  id, title, slug, price, discount_price, images, category, subcategory,
  brand, description, specifications, stock, rating, reviews_count,
  is_featured, is_new, is_bestseller, is_archived, created_at
) values (
  'p-024', '240W Type-C to Type-C Cable — Black', '240w-type-c-cable-black', 45000, 38000,
  '["/products/laptomo-baraa2/hq/type-c-cable-black-main.png","/products/laptomo-baraa2/hq/type-c-cable-black-angle.png","/products/laptomo-baraa2/hq/type-c-cable-black-detail.png"]'::jsonb, 'phone', 'ph-cable',
  'LS Tech', '0.3 метрийн түлхүүрийн оосортой Type-C to Type-C кабель. Богино, бат бөх, авч явахад амархан бөгөөд 240W хурдан цэнэглэлт дэмжинэ.',
  '[{"label":"Чадал","value":"240W"},{"label":"Урт","value":"0.3 м"},{"label":"Холбоос","value":"Type-C to Type-C"},{"label":"Өнгө","value":"Хар"}]'::jsonb, 45, 4.5, 11,
  false, true, true, false, '2026-07-10T09:35:00Z'
) on conflict (id) do nothing;

insert into public.products (
  id, title, slug, price, discount_price, images, category, subcategory,
  brand, description, specifications, stock, rating, reviews_count,
  is_featured, is_new, is_bestseller, is_archived, created_at
) values (
  'p-025', '240W Type-C to Type-C Cable — Orange', '240w-type-c-cable-orange', 45000, 38000,
  '["/products/laptomo-baraa2/hq/type-c-cable-orange-main.png","/products/laptomo-baraa2/hq/type-c-cable-orange-angle.png","/products/laptomo-baraa2/hq/type-c-cable-orange-detail.png"]'::jsonb, 'phone', 'ph-cable',
  'LS Tech', 'Улбар шар өнгийн 0.3 метр Type-C to Type-C түлхүүрийн оосортой кабель. Өдөр тутам авч явахад жижиг, хурдан цэнэглэлтэд найдвартай.',
  '[{"label":"Чадал","value":"240W"},{"label":"Урт","value":"0.3 м"},{"label":"Холбоос","value":"Type-C to Type-C"},{"label":"Өнгө","value":"Улбар шар"}]'::jsonb, 45, 4.5, 10,
  false, true, false, false, '2026-07-10T09:40:00Z'
) on conflict (id) do nothing;

insert into public.products (
  id, title, slug, price, discount_price, images, category, subcategory,
  brand, description, specifications, stock, rating, reviews_count,
  is_featured, is_new, is_bestseller, is_archived, created_at
) values (
  'p-026', 'Magnetic Selfie Fill Light', 'magnetic-selfie-fill-light', 119000, 98000,
  '["/products/laptomo-baraa2/hq/magnetic-selfie-fill-light-main.png","/products/laptomo-baraa2/hq/magnetic-selfie-fill-light-angle.png","/products/laptomo-baraa2/hq/magnetic-selfie-fill-light-left.png","/products/laptomo-baraa2/hq/magnetic-selfie-fill-light-right.png"]'::jsonb, 'phone', 'ph-camera',
  'LS Tech', 'Selfie болон бичлэг хийхэд зориулсан magnetic fill light. 3 өнгийн гэрлийн горим, гэрэлтүүлгийн тохируулгатай тул нүүр гэрэлтүүлэлт илүү жигд болно.',
  '[{"label":"Гэрэл","value":"3 color modes"},{"label":"Тохируулга","value":"Adjustable brightness"},{"label":"Суурилуулалт","value":"Magnetic mount"},{"label":"Зориулалт","value":"Selfie, vlog, live"}]'::jsonb, 20, 4.6, 14,
  false, true, true, false, '2026-07-10T09:45:00Z'
) on conflict (id) do nothing;

insert into public.products (
  id, title, slug, price, discount_price, images, category, subcategory,
  brand, description, specifications, stock, rating, reviews_count,
  is_featured, is_new, is_bestseller, is_archived, created_at
) values (
  'p-027', '14 инч Portable Monitor with Case', '14-portable-monitor-with-case', 790000, 690000,
  '["/products/laptomo-baraa2/hq/portable-monitor-14-case-main.png","/products/laptomo-baraa2/hq/portable-monitor-14-case-angle.png","/products/laptomo-baraa2/hq/portable-monitor-14-case-detail.png"]'::jsonb, 'single', 'mon-14',
  'LS Tech', '14 инчийн зөөврийн монитор, хамгаалалтын case-тэй. Лаптоп, гар утас, тоглоомын төхөөрөмжтэй холбож хоёр дахь дэлгэц болгон ашиглана.',
  '[{"label":"Дэлгэц","value":"14\" portable monitor"},{"label":"Нягтрал","value":"FHD 1080P"},{"label":"Панель","value":"IPS"},{"label":"Дагалдах","value":"Protective case"}]'::jsonb, 13, 4.7, 17,
  true, true, false, false, '2026-07-10T09:50:00Z'
) on conflict (id) do nothing;

-- Нийт 6 бараа оруулна.