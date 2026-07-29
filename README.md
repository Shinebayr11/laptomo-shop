# Laptomo — Premium лаптоп & технологийн дэлгүүр

> Монголд зориулсан, бүрэн ажиллагаатай (production-ready) e-commerce вэбсайт.
> Next.js 14 · TypeScript · Tailwind CSS · Supabase
>
> *A production-ready e-commerce store for laptops & tech accessories, built for the Mongolian market.*

---

## 🇲🇳 Монголоор

### Онцлог
- **Дэлгүүрийн нүүр** — premium hero, онцлох/шинэ/эрэлттэй бүтээгдэхүүн, ангилал, сэтгэгдэл, newsletter.
- **Бүтээгдэхүүний жагсаалт** — ангилал, брэнд, үнэ, эрэмбэлэлт (шинэ/хямд/үнэтэй/эрэлттэй), хайлт, шүүлтүүр.
- **Бүтээгдэхүүний дэлгэрэнгүй** — олон зураг, үнэ/хямдрал, нөөц, спекс, холбоотой бараа, сэтгэгдэл, үнэлгээ.
- **Сагс · Хүслийн жагсаалт · Захиалга** — Wire (QPay / банкны апп) болон бэлэн мөнгө сонголттой.
- **Хэрэглэгчийн бүртгэл** — нэвтрэх / бүртгүүлэх / профайл.
- **Админ самбар** — бүтээгдэхүүн нэмэх/засах/устгах, нөөц & үнэ, захиалгын төлөв, сэтгэгдэл удирдах, статистик.
- **Нэмэлт** — Dark / Light горим, хуудасны шилжилт, ачаалал & алдааны анимэйшн, SEO, responsive дизайн.

### Суулгах
```bash
npm install
npm run dev
```
Дараа нь хөтөч дээр `http://localhost:3000` нээнэ.

> **Чухал:** Supabase тохируулаагүй байсан ч сайт **шууд ажиллана** — дотроо жишиг өгөгдөлтэй (16 бүтээгдэхүүн, захиалга, сэтгэгдэл). Сагс, хүслийн жагсаалт нь хөтчийн localStorage дээр хадгална.

### Админ руу нэвтрэх (demo горим)
Supabase тохируулаагүй үед: и-мэйл нь **`admin`** гэж эхэлсэн бол админ эрхээр нэвтэрнэ.
- Жишээ: `admin@laptomo.mn` — нууц үг ямар ч байж болно.
- Дараа нь `/admin` хаягаар хяналтын самбар нээгдэнэ.

### Supabase холбох (production)
1. [supabase.com](https://supabase.com) дээр төсөл үүсгэнэ.
2. **SQL Editor** дотор `supabase/schema.sql`-г бүхэлд нь ажиллуулна (хүснэгт + RLS дүрэм).
3. (Заавал биш) `supabase/seed.sql`-г ажиллуулж жишиг бараа оруулна.
4. `.env.example`-г хуулж `.env.local` болгоод утгуудаа бөглөнө:
   ```bash
   cp .env.example .env.local
   ```
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   WIRE_API_KEY=sk_live_...
   ```
5. Эхний админ хэрэглэгчийг гараар тохируулна:
   ```sql
   update public.profiles set role = 'admin' where email = 'таны@имэйл.mn';
   ```
6. Нөөцийн хяналтыг асаана (доорх **Нөөцийн хяналт** хэсгийг үзнэ үү).

### Нөөцийн хяналт
Supabase SQL Editor дотор дараах хоёр файлыг **энэ дарааллаар** нэг удаа ажиллуулна:

1. `supabase/sync-missing-products.sql` — кодын seed дотор байгаа ч DB-д
   байхгүй бараануудыг оруулна. Нөөц хянагдахын тулд бараа бүр DB-д мөртэй
   байх ёстой. `on conflict do nothing` учир одоо байгаа мөрүүд (архивласан
   төлөв орно) огт хөндөгдөхгүй.
2. `supabase/stock-tracking.sql` — `place_order` болон `set_order_status`
   функцуудыг үүсгэнэ.

**Хэрхэн ажилладаг вэ**
- Захиалга үүсэх үед нөөц нь **нэг transaction дотор** хасагдана. Нөөц
  хүрэлцэхгүй бол захиалга огт үүсэхгүй.
- Зэрэг ирсэн хоёр захиалгын хоёр дахь нь шинэчлэгдсэн үлдэгдэл дээр дахин
  шалгагдах тул илүү зарагдах (oversell) эрсдэлгүй.
- Захиалгыг **цуцлахад нөөц буцаж нэмэгдэнэ**, цуцлагдсанаас сэргээхэд дахин
  хасагдана.
- Ижил `order_id`-тай хүсэлт давхар ирвэл нөөц дахин хасагдахгүй (төлбөр
  төлөөд буцах хуудсаа refresh хийх тохиолдол).
- Нөөц болон үнэ хоёулаа **server талд шалгагдана** — browser-ээс тоо, үнийг
  хуурах боломжгүй.

Админ самбарт `Нөөц дуусаж буй` хэсэг нэмэгдсэн: 5 ба түүнээс бага
үлдэгдэлтэй бараа шар, дууссан нь улаанаар тэмдэглэгдэнэ. Хязгаарыг
`src/constants/site.ts` доторх `LOW_STOCK_THRESHOLD`-оор өөрчилнө.

#### SQL-ээ турших
Supabase дээр ажиллуулахаас өмнө локалд шалгаж болно. Түр Postgres асаж,
дуусмагц устана — Supabase project ч, Docker ч хэрэггүй:

```bash
npm install --no-save embedded-postgres && node scripts/test-sql.js
```

Нөөц хасалт, oversell, цуцлалт, идемпотент байдал, үнэ хуурах оролдлого,
эрхийн хяналт зэрэг 19 тест ажиллана.

### Wire төлбөр холбох
1. Wire dashboard дээр project, operator connection болон төлбөр хүлээн авах дансаа баталгаажуулна.
2. API key хэсгээс `sk_live_...` түлхүүр үүсгэнэ.
3. `.env.local` болон Vercel Environment Variables дотор `WIRE_API_KEY` болгон нэмнэ. Энэ түлхүүрт `NEXT_PUBLIC_` prefix огт хэрэглэж болохгүй.
4. Wire dashboard дээр буцах хаягаа зөвшөөрөгдсөн жагсаалтад нэмнэ:
   `https://<таны-домэйн>/checkout`
5. Серверээ дахин асаана. Checkout дээрх **Wire-ээр төлөх** товч бодит PaymentIntent үүсгэж, төлбөрийн холбоос руу шилжүүлнэ.

`WIRE_ALLOWED_OPERATORS` болон `WIRE_OPERATOR` нь сонголттой. Wire project дээр automatic operator тохируулсан бол хоосон үлдээж болно.

#### Урсгал хэрхэн ажилладаг вэ
1. Client нь зөвхөн `product_id` + `quantity` илгээнэ. **Үнийг сервер DB-ээс тооцно** — үнэ, хүргэлтийн дүнг browser-ээс хуурах боломжгүй.
2. Сервер нь нөөц, архивлагдсан эсэхийг шалгаад PaymentIntent үүсгэж, `return_url`-тэй confirm хийнэ.
3. Захиалгын мэдээлэл (бараа, хэрэглэгч, хаяг) `localStorage` дотор хадгалагдана — банкны апп шинэ tab-аар буцсан ч алдагдахгүй.
4. Буцаж ирэхэд төлөв автоматаар 5 удаа (3 секунд тутам) шалгагдана. Амжилттай бол захиалга бүртгэгдэж, сагс цэвэрлэгдэнэ.
5. Захиалга `ON CONFLICT DO NOTHING`-оор бичигддэг тул буцах хуудсыг дахин ачаалахад давхар захиалга үүсэхгүй.

#### Mock server-ээр турших
Бодит түлхүүр, бодит мөнгө хөдөлгөхгүйгээр урсгалыг шалгана. Хоёр terminal:
```bash
node scripts/mock-wire.js
```
```bash
WIRE_API_KEY=sk_test_mock WIRE_API_BASE_URL=http://localhost:3200 npm run dev
```
Mock нь 3 дахь шалгалт дээр `succeeded` болдог тул автомат polling ажиллаж
байгааг харж болно.

### Wire webhook
Webhook нь **заавал биш** — Wire өөрөө operator-оос төлбөрийг шалгадаг тул
тохируулаагүй ч төлбөр зөв баталгаажна. Гэхдээ хэрэглэгч төлбөрөө төлөөд
browser-ээ хаачихвал таны сайт мэдэхгүй үлддэг. Webhook нь тэр цоорхойг нөхнө.

**1. SQL:** `supabase/stock/04-payment-events.sql`-ийг ажиллуулна.

**2. Environment хувьсагч** (`.env.local` + Vercel):
```
WIRE_WEBHOOK_SECRET=whsec_...          # endpoint үүсгэх үед НЭГ УДАА харагдана
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...  # Supabase → Settings → API Keys → Secret keys
```
Хуучин түлхүүрийн системтэй төсөлд `service_role` (`eyJ...`) байж болно — тэр ч мөн
адил ажиллана. Хоёулаа RLS-ийг тойрдог.
Хоёулаа `NEXT_PUBLIC_` prefix-гүй — client-д хэзээ ч очихгүй.

**3. Deploy хийнэ.** Wire нь интернэтээс хандах ёстой тул `localhost` болохгүй.

**4. Wire dashboard → Webhook endpoints → Endpoint нэмэх:**
```
https://<таны-домэйн>/api/wire/webhook
```
Дараа нь **Баталгаажуулах** дарна. Wire `type=endpoint.verification` ping
илгээж, endpoint `2xx` буцаавал идэвхжинэ.

**Хамгаалалт**
- `WirePayment-Signature` толгойг HMAC-SHA256-аар шалгана (`t.rawBody`)
- Харьцуулалт timing-safe — гарын үсгийг таах боломжгүй
- 5 минутаас хуучин `t`-г татгалзана (replay халдлага)
- Event `id` нь primary key — Wire дахин илгээсэн ч давхардахгүй
- Хуурамч гарын үсэг → `400` (Wire дахин оролдохгүй)
- Тохиргоо дутуу / DB алдаа → `5xx` (Wire дахин илгээнэ, event алдагдахгүй)

**Турших**
```bash
node scripts/test-webhook.js
```
Ажиллаж буй сервер рүү бодит хүсэлт илгээх бол:
```bash
WEBHOOK_URL=http://localhost:3000/api/wire/webhook WIRE_WEBHOOK_SECRET=whsec_test node scripts/test-webhook.js
```

**Төлбөр орсон ч захиалга бүртгэгдээгүй тохиолдлыг олох** (SQL Editor):
```sql
select e.order_id, e.amount, e.created_at
from public.payment_events e
where e.succeeded
  and e.created_at < now() - interval '10 minutes'
  and not exists (select 1 from public.orders o where o.id = e.order_id);
```

#### ⚠️ Webhook-ийн одоогийн хязгаар
Webhook нь төлбөр орсныг **бүртгэнэ**, гэхдээ захиалгыг **өөрөө үүсгэхгүй**.
Учир нь захиалгын дэлгэрэнгүй (бараа, хаяг, утас) хэрэглэгчийн browser-т
хадгалагддаг — server тэдгээрийг мэдэхгүй. Тиймээс хэрэглэгч төлбөр төлөөд
буцаж ирээгүй бол дээрх query-гээр илрүүлж, гараар шийднэ.

Бүрэн автоматжуулах бол захиалгын мэдээллийг PaymentIntent үүсгэх үед server
талд хадгалах хэрэгтэй (`pending_orders` хүснэгт) — тусдаа ажил.

#### ⚠️ Нөөцийн SQL
`supabase/stock/01…03`-ийг ажиллуулаагүй бол захиалга огт бүртгэгдэхгүй
(checkout дээр тодорхой мессеж гарна).

### Deploy хийх (Vercel + .mn домэйн)
1. Кодоо GitHub руу push хийнэ.
2. [vercel.com](https://vercel.com) дээр төслөө import хийнэ.
3. Environment Variables дотор Supabase түлхүүрүүдээ нэмнэ.
4. Deploy дарна. Дараа нь `laptomo.mn` зэрэг домэйнээ **Settings → Domains** хэсэгт холбоно.

---

## 🇬🇧 English

A premium, production-ready e-commerce store (laptops & tech accessories) localized for Mongolia (Mongolian UI, MNT pricing, QPay/SocialPay).

### Quick start
```bash
npm install
npm run dev   # http://localhost:3000
```
The app runs **immediately without any database** using built-in seed data. Cart & wishlist persist via `localStorage`.

### Admin access (demo mode)
With no Supabase configured, any email starting with `admin` (e.g. `admin@laptomo.mn`) logs in as admin → visit `/admin`.

### Connecting Supabase
Run `supabase/schema.sql` in the Supabase SQL Editor (creates tables + RLS), copy `.env.example` → `.env.local`, fill in your keys, then promote a user to admin via SQL.

### Deploy
Push to GitHub → import on Vercel → add env vars → deploy → attach your custom `.mn` domain.

---

## 🗂 Бүтэц (Project structure)
```
src/
├── app/                # App Router хуудсууд (home, products, cart, checkout, admin...)
│   ├── admin/          # Хяналтын самбар (products, orders, reviews)
│   ├── products/       # Жагсаалт + [slug] дэлгэрэнгүй
│   └── ...             # cart, wishlist, checkout, login, register, account
├── components/         # Дахин ашиглагдах компонентууд
│   ├── admin/  cart/  filters/  home/  layout/  product/  providers/  ui/
├── constants/          # categories, site тохиргоо
├── data/               # Жишиг өгөгдөл (products, orders, reviews)
├── hooks/              # useAuth, useLocalStorage
├── lib/                # Supabase client/server, өгөгдлийн давхарга
├── store/              # Cart, Wishlist, Admin контекст
├── types/              # TypeScript төрлүүд
└── utils/              # format, filter туслахууд
supabase/
├── schema.sql          # Хүснэгт + RLS дүрэм
└── seed.sql            # Жишиг өгөгдөл
```

### Tech stack
Next.js 14 (App Router, SSR+CSR) · TypeScript · Tailwind CSS · Supabase (Postgres + Auth + RLS) · framer-motion · lucide-react · next-themes.

### Аюулгүй байдал (Security)
- Админ хуудас `AdminGuard`-аар хамгаалагдсан.
- Supabase RLS: бүтээгдэхүүн нийтэд унших / зөвхөн админ бичих; хэрэглэгч өөрийн захиалга & сэтгэгдлийг л удирдана.
