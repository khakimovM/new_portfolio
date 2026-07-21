# CHANGELOG — qilingan ishlar tarixi

Har bir sessiyada nima qilingani shu yerda saqlanadi. Yangi ish qilinganda tepasiga qo'shib boriladi.

## 2026-07-21 — Loyihalar tartibini bot orqali boshqarish

- OG banner tuzatildi: eski `public/og.png` aslida 176×118 bo'lgani uchun Telegram
  link preview'da rasm chiqmayotgan edi — terminal uslubidagi haqiqiy 1200×630 banner
  bilan almashtirildi (SVG → sharp). Telegram keshi @WebpageBot orqali yangilanadi

- Bot: 📁 Loyihalar menyusida yangi «🔀 Tartib» tugmasi — raqamlangan ro'yxat, har bir
  loyiha uchun ⬆️/⬇️ tugmalar (birinchisida ⬆️, oxirgisida ⬇️ yo'q). Bosilganda qo'shnisi
  bilan o'rin almashadi, xabar joyida yangilanadi, `revalidateTag("projects")` chaqiriladi
- Almashtirishda `sort_order` 1..n qilib normalizatsiya qilinadi (eski «hammasi 0» holati
  birinchi bosishdayoq tuziladi); migratsiya kerak bo'lmadi — ustun avvaldan bor edi
- `saveNewProject`: yangi loyiha `sort_order = max + 1` bilan yoziladi (ro'yxat oxiriga)
- Sayt (`src/lib/data.ts`): `featured DESC` saralash olib tashlandi — tartib endi to'liq
  `sort_order` (keyin `created_at`) bo'yicha; ★ featured faqat belgi sifatida qoladi

## 2026-07-09 — Ko'p rasm (karusel), SEO, favicon, About tartibi

### 1. Loyihalarga 10 tagacha rasm + karusel
- Baza: `image_url` → `image_urls text[]` (migratsiya: `supabase/migration-project-images.sql`,
  ishga tushirilgan; eski ustunni o'chirish ixtiyoriy qadam sifatida kutmoqda)
- UI: `src/components/ui/ProjectCarousel.tsx` — 4 soniyada avto almashinish (hover'da pauza),
  hover'da chiqadigan oldingi/keyingi tugmalar, nuqta-indikatorlar, sichqoncha/barmoq bilan surish
  (karta linki drag'dan keyin bosilib ketmasligi uchun himoya; `draggable=false` muhim edi)
- Bot: rasm yig'ish sikli — har rasmdan keyin «n/10», pastdan «✅ Tugatish» reply keyboard,
  10 tada avto saqlash; «🖼 Rasmlar» mavjud loyihada ham shu oqim (eskilarini almashtiradi)
- Rasmlar `projects/{id}/{n}.jpg` yo'lida saqlanadi

### 2. SEO (Google'da ism bo'yicha topilish)
- `generateMetadata`: ikki tilda title/description, ism imlo variantlari keywords'da,
  hreflang/canonical, Open Graph + Twitter kartalar, `public/og.png` (1200×630)
- JSON-LD `Person` sxemasi (`alternateName`da barcha imlolar: Khakimov/Xakimov,
  Mukhammadaziz/Muxammadaziz...) + `WebSite`
- `src/app/sitemap.ts`, `src/app/robots.ts`
- Search Console: domen DNS TXT orqali tasdiqlangan (ahost.uz panelida, Host=`@`)
- Vercel: asosiy domen `codewithaziz.uz` qilindi, `www` unga 308 redirect (avval teskarisi edi)

### 3. Mayda ishlar
- Favicon: `src/app/icon0.svg` (yumaloq burchakli `<A>` logo) + `icon1.png` (Safari zaxirasi)
- About: katta ekranda rasm chapda/matn o'ngda, telefonда matn birinchi (`lg:order-*`)

### Kutilayotgan
- Profildagi GitHub linki hali seed'dagi bo'sh `https://github.com/` — bot orqali to'g'rilash kerak
- Search Console'da sitemap yuborish + Request Indexing (foydalanuvchi tomonida)

## 2026-07-02 — Loyiha yaratildi va to'liq ishga tushirildi

### 1. Asos (noldan qurildi)
- **Stack tanlandi**: Next.js 16 (App Router, TS, Tailwind v4) + Supabase (baza/storage) +
  Telegram bot (grammY, webhook) + Vercel hosting — 0 so'm xarajat sharti bilan
- `create-next-app` scaffold + `motion`, `next-intl`, `@supabase/supabase-js`, `grammy`, `lenis`
- **Supabase sxema** (`supabase/schema.sql`): profile, projects, skills, experience, orders,
  bot_sessions jadvallari + RLS (hammaga o'qish, yozish faqat service role) + `portfolio`
  storage bucket + seed ma'lumotlar
- **Data layer**: `src/lib/supabase.ts` (anon/admin klientlar), `src/lib/data.ts`
  (unstable_cache + tag'lar), env yo'q bo'lsa demo-data fallback
- **i18n**: next-intl v4, `/` = EN, `/uz` = UZ, `src/proxy.ts` (Next 16'da middleware o'rniga)

### 2. Telegram bot (admin panel o'rnida)
- Webhook: `src/app/api/telegram/route.ts` (secret_token tekshiruvi, faqat admin ID uchun CRUD)
- Suhbat holati `bot_sessions` jadvalida (serverless xotira saqlamaydi)
- To'liq CRUD: Loyihalar (6 qadamli wizard + maydon tahriri), Skills, Tajriba, Profil
- Rasm/CV yuklash: Telegram file API → Supabase Storage → URL bazaga
- Har o'zgarishdan keyin `revalidateTag(tag, "max")` — sayt darhol yangilanadi

### 3. Buyurtma tizimi
- Sayt formasi → server action (`src/app/actions/order.ts`) → draft order + token →
  `t.me/<bot>?start=order_<token>` deep-link
- Botda mijoz tasdiqlaydi → adminga «yangi buyurtma» xabari (qabul/rad tugmalari) →
  qabul qilinsa mijozga admin kontaktlari (profile.telegram_username + phone) yuboriladi

### 4. Deploy va sozlash
- GitHub: https://github.com/khakimovM/new_portfolio (main)
- Vercel: https://new-portfolio-seven-pearl-73.vercel.app — env'lar kiritilgan, webhook o'rnatilgan
- Supabase project: `mmvplgnyapsnlhweeipm.supabase.co`
- ⚠️ **Hal qilingan xato**: `NEXT_PUBLIC_SUPABASE_URL` oxirida `/rest/v1/` bo'lsa
  «Invalid path» xatosi chiqadi — URL faqat `https://xxx.supabase.co` bo'lishi kerak
- Bot foydalanuvchi tomonidan sinab tasdiqlangan (admin menyu ishlaydi)

### 5. Adabiy o'zbek tili + hujjatlar
- Barcha «zakaz» so'zlari «buyurtma»ga almashtirildi (sayt + bot xabarlari)
- Qoida CLAUDE.md/PROJECT.md'da muhrlandi: faqat adabiy o'zbekcha, ruscha o'zlashmalar taqiqlangan
- `PROJECT.md` (arxitektura, konventsiyalar), `CLAUDE.md` (@AGENTS.md + @PROJECT.md import),
  `.claude/settings.json` (xavfsiz ruxsatlar, .env.local o'qish taqiqi) yaratildi

### 6. Qayta dizayn — Anthropic.com uslubi (foydalanuvchi so'rovi)
- Eski qora terminal-tema o'rniga: **krem palitra** (#faf9f5 fon, #e8e3d5 bej kartalar,
  #d97757 «Claude apelsin» aksent), **Source Serif 4** sarlavhalar + Inter body
- Terminal oynasi to'q karta sifatida saqlandi (krem fonda kontrast aksent)
- **Boy animatsiyalar**: Lenis smooth-scroll, hero'da ism so'zma-so'z mask'dan chiqadi,
  rasmlarda parallax, navbar scroll'da yashirinadi, loyiha kartalari stagger + hover zoom,
  tajriba timeline chizig'i scroll'ga qarab chiziladi
- **Skills — cheksiz marquee**: 2 qator qarama-qarshi yo'nalishda, hover'da pauza,
  chetlari fade-mask (`globals.css`dagi CSS animatsiya, JS'siz)
- **Yangi «Men haqimda» bo'limi** (`src/components/sections/About.tsx`): editorial split —
  chapda bio + ijtimoiy linklar, o'ngda ikkinchi rasm bej kartada
- Baza: `profile.about_image_url` ustuni qo'shildi (foydalanuvchi ALTER'ni bajardi),
  botda «👤 Profil → 🖼 About rasm» yuklash tugmasi
- Footer'dan «Next.js + Supabase asosida...» va «© ... huquqlar himoyalangan» olib tashlandi

### Kutilayotgan ishlar (keyingi sessiyalar uchun)
- [ ] `codewithaziz.uz` domenini Vercel'ga ulash (A `@` → 76.76.21.21, CNAME `www` → cname.vercel-dns.com)
- [ ] Nano banana'da hero + about rasmlar (promptlar berilgan: bej kresloda, espresso-jigarrang
  ko'ylak, och kulrang fon → PNG cutout; hero — laptop bilan kameraga, about — o'ng yelka orqali chapga qaraydi)
- [ ] Rasmlar yuklangach: kartalarni `object-cover` → pastga tekislangan `object-contain`ga
  o'tkazish (PNG-cutout chiroyli turishi uchun) — Hero.tsx va About.tsx
- [ ] Profildagi placeholder'larni bot orqali almashtirish: haqiqiy GitHub URL, telegram_username
  (buyurtma qabulida mijozga yuboriladi!), CV PDF yuklash
- [ ] Supabase free tier: 1 hafta faoliyatsiz bo'lsa pause — vaqti-vaqti bilan tekshirish
