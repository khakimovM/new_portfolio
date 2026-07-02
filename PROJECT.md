# PROJECT.md — codewithaziz.uz dinamik portfolio

> Qilingan ishlar tarixi va kutilayotgan vazifalar: `CHANGELOG.md`da.
> Yirik ish tugagach o'sha faylga yozib borilsin.

## Loyiha maqsadi

Muxammadaziz Khakimovning shaxsiy portfoliosi. Ikki vazifasi bor:
1. Ishlarini ko'rsatish (loyihalar, ko'nikmalar, tajriba)
2. Xizmat sotish — mehmonlar saytdan buyurtma beradi, buyurtma Telegram orqali tasdiqlanadi

Asosiy cheklov: **0 so'm xarajat**. Server yo'q, hamma narsa tekin tier'larda ishlaydi.

## Arxitektura

```
Telegram (admin) ──webhook──▶ Vercel: /api/telegram ──service key──▶ Supabase
                                     │ o'zgarishdan keyin revalidateTag()
Mehmon ──▶ sayt (ISR keshlangan) ◀──anon key (faqat o'qish)── Supabase
```

- Sahifalar `unstable_cache` + tag bilan keshlanadi (`src/lib/data.ts`). Bot ma'lumot
  o'zgartirsa `revalidateTag(tag, "max")` chaqiriladi — sayt darhol yangilanadi.
- Kontentni boshqarish uchun admin panel YO'Q — hammasi Telegram bot orqali.
- Bot webhook rejimida (long-polling emas!) — serverless'da doimiy jarayon bo'lmaydi.
- Suhbat holati (wizard qadamlari) `bot_sessions` jadvalida, chunki serverless
  funksiya xotirasi so'rovlar orasida saqlanmaydi.

## Stack

| Qism | Texnologiya |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, TypeScript) |
| Stil | Tailwind CSS v4 (`@theme inline`, token'lar `globals.css`da) |
| Animatsiya | `motion` (Framer Motion) — `motion/react` dan import |
| i18n | `next-intl` v4 — `/` = EN, `/uz` = UZ (`localePrefix: "as-needed"`) |
| Baza/Storage | Supabase (`@supabase/supabase-js`), project: mmvplgnyapsnlhweeipm |
| Bot | grammY, webhook: `/api/telegram` |
| Hosting | Vercel (hobby), repo: github.com/khakimovM/new_portfolio |

## Fayl tuzilishi

```
supabase/schema.sql           # Jadvallar + RLS + storage + seed (bir marta ishga tushiriladi)
messages/{en,uz}.json         # UI tarjimalari
src/
  proxy.ts                    # next-intl middleware (Next 16'da proxy deb ataladi)
  i18n/                       # routing, request config, navigation
  app/[locale]/               # layout (fontlar, provider) + bitta sahifali page
  app/api/telegram/route.ts   # Bot webhook (secret_token tekshiruvi shu yerda)
  app/actions/order.ts        # Buyurtma server action → deep-link qaytaradi
  components/sections/        # Hero, Skills, Projects, Experience, OrderContact
  components/ui/              # TerminalWindow (typing), Reveal (scroll), SectionHeading
  lib/
    supabase.ts               # supabasePublic (anon) / supabaseAdmin (service role)
    data.ts                   # Keshlangan fetch'lar + CACHE_TAGS
    types.ts                  # DB tiplar + localized() helper
    demo-data.ts              # Env yo'q bo'lsa ko'rinadigan demo ma'lumot
    bot/                      # index (bot factory), admin (CRUD), orders, sessions, storage, format
```

## Ma'lumotlar modeli (Supabase)

- `profile` — bitta qator (id=1): ism, lavozim, bio, hero rasm, kontaktlar, CV URL
- `projects` — bitta `url` maydoni: production sayt YOKI GitHub (deploy bo'lmagan/yashirin bo'lsa)
- `skills` — faqat nom + kategoriya, daraja/baho YO'Q (ataylab)
- `experience` — work/education/certificate, `end_date=null` → "Hozirgacha"
- `orders` — status oqimi: draft → pending → accepted/rejected/cancelled
- `bot_sessions` — bot wizard holati (chat_id → {flow, step, data})
- Ikki tilli maydonlar `_en`/`_uz` suffiks bilan; RLS: hammaga o'qish, yozish faqat service role

## Buyurtma oqimi

1. Saytdagi forma → server action `orders`ga draft yozadi, token yaratadi
2. Mijoz `t.me/<bot>?start=order_<token>` ga yo'naltiriladi
3. Bot buyurtmani ko'rsatadi → mijoz tasdiqlaydi → status pending → adminga xabar
4. Admin qabul qilsa → mijozga profildagi telegram_username + phone yuboriladi

## Buyruqlar

```bash
npm run dev      # http://localhost:3000 (EN), /uz (UZ)
npm run build    # Production build (deploy'dan oldin albatta o'tkazish)
npm run lint     # ESLint
```

Deploy: `git push` → Vercel avtomatik deploy qiladi. Webhook allaqachon o'rnatilgan.

## Env o'zgaruvchilar (.env.local, Vercel'da ham xuddi shu)

`NEXT_PUBLIC_SUPABASE_URL` (⚠️ oxirida `/rest/v1/` BO'LMASIN — bir marta shu xato bo'lgan),
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`,
`NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`, `TELEGRAM_ADMIN_ID`, `TELEGRAM_WEBHOOK_SECRET`

## Qoidalar / konventsiyalar

1. **Adabiy o'zbek tili**: barcha foydalanuvchiga ko'rinadigan matnlar adabiy o'zbekchada
   bo'lsin — «buyurtma» (❌ zakaz), «yuklab olish» (❌ skachat), «sozlamalar» (❌ nastroyka).
   Ruscha o'zlashmalar ishlatilmasin.
2. Yangi UI matn qo'shilsa — **ikkala** messages fayliga (en.json va uz.json) qo'shilsin.
3. Bazaga yangi kontent maydoni qo'shilsa — `_en` va `_uz` juftligi bilan.
4. Ma'lumot o'zgartiruvchi har bir bot amali `revalidateTag` chaqirishi shart.
5. `SUPABASE_SERVICE_ROLE_KEY` faqat server kodida (`supabaseAdmin`) — clientga chiqmasin.
6. Bot CRUD faqat `TELEGRAM_ADMIN_ID` uchun; buyurtma oqimi hammaga ochiq.
7. Next 16 xususiyatlari: `params` — Promise (`await params`), `revalidateTag(tag, "max")`
   ikki argument, middleware o'rniga `src/proxy.ts`.
8. Dizayn token'lari `globals.css`dagi CSS o'zgaruvchilarda (`--accent`, `--surface`...) —
   ranglarni komponentlarga hardcode qilmaslik.

## Ma'lum muammolar / eslatmalar

- Supabase free tier 1 hafta faoliyatsiz bo'lsa pause bo'ladi (dashboard'dan Restore)
- `uz-UZ` locale oy nomlarini bermaydi — `Experience.tsx`da qo'lda yozilgan oy nomlari bor
- Hero rasm placeholder (`public/hero-placeholder.svg`) — haqiqiy rasm bot orqali yuklanadi
