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
- **Сагс · Хүслийн жагсаалт · Захиалга** — QPay / SocialPay / бэлэн мөнгө сонголттой.
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
   ```
5. Эхний админ хэрэглэгчийг гараар тохируулна:
   ```sql
   update public.profiles set role = 'admin' where email = 'таны@имэйл.mn';
   ```

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
