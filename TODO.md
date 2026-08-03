# Үлдсэн ажлууд

Дэлгүүр production дээр ажиллаж байна: https://www.lstechstore.com

Дууссан: домэйн + SSL, Wire QPay төлбөр, нөөцийн хяналт, админ эрхийн
хамгаалалт, имэйл (Resend), sitemap/robots, төлбөр төлөөд буцаж ирээгүй
тохиолдлын нөхөлт.

---

## 🔴 Эрсдэлтэй

### 1. Түлхүүр шинэчлэх
Хөгжүүлэлтийн явцад дэлгэцийн зурган дээр дараах түлхүүрүүдийн эхлэл ил гарсан:
`sk_live_pnp75u6…` (Wire), `whsec_fu4chCPXT…` (webhook), `sb_secret_1b0ILSwz…` (Supabase).

Бүтнээрээ гараагүй ч төлбөрийн live key тул шинэчлэх нь зөв.

- Wire dashboard → API key дахин үүсгэх → Vercel `WIRE_API_KEY`
- Wire → Webhook endpoint дахин үүсгэх → Vercel `WIRE_WEBHOOK_SECRET`
- Supabase → Settings → API Keys → шинэ secret key → Vercel `SUPABASE_SERVICE_ROLE_KEY`

Тус бүрийн дараа Vercel дээр **Redeploy** хийнэ.

### 2. Бодит нөөц оруулах
Одоогийн тоо (8, 7, 45, 45, 20, 13) нь `src/data/products.ts` дахь зохиомол утга.

Админ самбар → Бүтээгдэхүүн → бараа бүрийн «Нөөц» талбарыг агуулахын
бодит үлдэгдлээр солино.

### 3. Захиалгын мэдэгдэл
Одоо шинэ захиалга ирснийг мэдэх арга байхгүй — админ самбараа өөрөө шалгана.

Хоёр хувилбар:
- **Telegram bot** — BotFather-аас bot үүсгэж token + chat ID авна. Дараа нь
  Supabase Database Webhook (`orders` хүснэгтэд insert) → `/api/notify/order`.
  Бэлэн, Wire бүх захиалга дээр ажиллана.
- **Имэйл** — Resend аль хэдийн тохируулагдсан тул худалдан авагчид баталгаа
  илгээх боломжтой.

### 4. Буцаалт гараар
Захиалга цуцлахад нөөц буцна, гэхдээ **мөнгө автоматаар буцахгүй**.
Wire dashboard эсвэл банкаар гараар хийнэ.

---

## 🟡 Итгэл, ажиллагаа

### 5. Хуулийн хуудсууд
Үйлчилгээний нөхцөл, буцаалт/солилтын журам, нууцлалын бодлого.
Footer-т холбоос нэмнэ.

### 6. `SITE.email` буруу
`src/constants/site.ts` дотор `hello@lstechstore.mn` — байхгүй домэйн.
Footer-т харагдаж байгаа тул бичсэн захидал хүрэхгүй.

Сонголт: Cloudflare Email Routing-оор `info@lstechstore.com` үүсгэж gmail руу
дамжуулах (үнэгүй), эсвэл `adminlaptomo@gmail.com` болгох.

### 7. Google Search Console
sitemap бүртгүүлээгүй. search.google.com/search-console → URL prefix →
`https://www.lstechstore.com` → DNS аргаар баталгаажуулах (Cloudflare-д TXT
бичлэг) → Sitemaps хэсэгт `sitemap.xml` нэмэх.

### 8. Хоосон ангилал
Navbar дээрх «Дагалдах хэрэгсэл» (`?category=accessory`) ангилалд бараа
байхгүй. Бараа нэмэх эсвэл `src/constants/site.ts` доторх `NAV_LINKS`-ээс авах.

### 9. `test` бараа
Архивласан хэвээр DB-д байна (`p-1785301923818`). Устгах бол:

```sql
delete from public.products where id = 'p-1785301923818';
```

---

## ⚪ Өнгө засал

### 10. Hero зураг theme дагах
`public/products/hero/ls-tech-hero.png` нь бараан дэвсгэр шингэсэн нэг файл
тул light/dark хооронд солигдохгүй. Дэвсгэргүй (transparent) PNG гаргаж
ирвэл `src/components/home/HomeHero.tsx` дээр холбож болно — тайлбарыг
файл дотор бичсэн.

### 11. Алдааны мониторинг
Sentry гэх мэт байхгүй. Production дээр юм эвдэрвэл мэдэхгүй.

### 12. Сэтгэгдлийн хэсэг
`ProductReviews`, `ReviewForm` кодод байгаа ч бодитоор туршиж үзээгүй.

---

## Ашигтай тушаалууд

```bash
# SQL-ээ локал Postgres дээр шалгах (Supabase хэрэггүй)
npm install --no-save embedded-postgres && node scripts/test-sql.js

# Wire webhook-ийн гарын үсгийн шалгалт
node scripts/test-webhook.js

# Wire-ийг бодит түлхүүргүйгээр турших
node scripts/mock-wire.js          # нэг terminal дээр
WIRE_API_KEY=sk_test_mock WIRE_API_BASE_URL=http://localhost:3200 npm run dev
```

## Хяналтын query

Төлбөр орсон ч захиалга бүртгэгдээгүй тохиолдлыг олох (одоо webhook
автоматаар нөхдөг тул хоосон байх ёстой):

```sql
select e.order_id, e.amount, e.created_at
from public.payment_events e
where e.succeeded
  and e.created_at < now() - interval '10 minutes'
  and not exists (select 1 from public.orders o where o.id = e.order_id);
```
