# codewithaziz.uz — Dinamik Portfolio

Next.js + Supabase + Telegram bot asosidagi shaxsiy portfolio. Barcha kontent (loyihalar, ko'nikmalar, tajriba, profil, CV) **Telegram bot orqali** boshqariladi — alohida admin panel yoki server kerak emas. 100% tekin stack: Vercel (hosting) + Supabase (baza/storage) + Telegram (admin panel).

## Arxitektura

```
Telegram (siz) ──webhook──▶ Vercel: /api/telegram ──service key──▶ Supabase
                                   │ o'zgarishdan keyin revalidateTag()
Mehmon ──▶ codewithaziz.uz (ISR keshlangan sahifalar) ◀──anon key── Supabase
```

Zakaz oqimi: saytdagi forma → `orders` jadvaliga draft → mijoz Telegram botga yo'naltiriladi → tasdiqlaydi → sizga "yangi zakaz" xabari → qabul qilsangiz mijozga kontaktlaringiz yuboriladi.

## Ishga tushirish (bir martalik sozlash)

### 1. Supabase

1. [supabase.com](https://supabase.com) da tekin akkaunt va yangi project oching
2. SQL Editor'ga kirib `supabase/schema.sql` faylini to'liq nusxalab ishga tushiring (jadvallar + RLS + storage + boshlang'ich ma'lumotlar yaratiladi)
3. **Project Settings → API** dan `URL`, `anon` va `service_role` kalitlarini oling

### 2. Telegram bot

1. [@BotFather](https://t.me/BotFather) ga `/newbot` yozib bot yarating → **token**ni oling
2. Bot **username**'ini eslab qoling (masalan `codewithaziz_bot`)
3. O'z Telegram ID'ingizni bilish uchun [@userinfobot](https://t.me/userinfobot) ga yozing

### 3. Env fayl

`.env.example` dan nusxa olib `.env.local` yarating va qiymatlarni to'ldiring.

### 4. Lokal ishga tushirish

```bash
npm install
npm run dev
```

Sayt: http://localhost:3000 (EN) va http://localhost:3000/uz (UZ).
Env to'ldirilmagan bo'lsa sayt demo ma'lumotlar bilan ochiladi.

### 5. Vercel'ga deploy

1. Loyihani GitHub'ga push qiling
2. [vercel.com](https://vercel.com) da **Import Project** → repo'ni tanlang
3. **Environment Variables** bo'limiga `.env.local` dagi barcha qiymatlarni kiriting
4. Deploy tugagach webhook'ni o'rnating (brauzerda oching, qiymatlarni almashtiring):

```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://codewithaziz.uz/api/telegram&secret_token=<TELEGRAM_WEBHOOK_SECRET>
```

`{"ok":true,"result":true}` chiqsa — bot ishlayapti. Botga `/start` yozib tekshiring.

### 6. Domen (codewithaziz.uz)

1. Vercel project → **Settings → Domains** → `codewithaziz.uz` qo'shing
2. Domen provayderingizda Vercel ko'rsatgan DNS yozuvlarini qo'ying:
   - `A` yozuv: `@` → `76.76.21.21`
   - `CNAME` yozuv: `www` → `cname.vercel-dns.com`
3. DNS tarqalgach (bir necha daqiqa–soat) sayt domeningizda ochiladi

## Bot komandalar (faqat admin)

- `/start` yoki `/menu` — boshqaruv menyusi: 📁 Loyihalar, 🛠 Ko'nikmalar, 💼 Tajriba, 👤 Profil, 📋 Zakazlar
- `/cancel` — joriy amalni bekor qilish
- Rasm almashtirish: Profil → 🖼 Hero rasm → foto yuboring (nano banana'da generate qilgan rasmingizni shu yerdan yuklaysiz)
- CV yangilash: Profil → 📄 CV → PDF yuboring

## Eslatmalar

- **Supabase pause**: free tier'da project 1 hafta ishlatilmasa uxlab qoladi — saytga haftada bir kirish yoki dashboard'ga kirish kifoya
- Sahifalar ISR bilan keshlanadi; bot o'zgartirish kiritganda avtomatik yangilanadi (`revalidateTag`)
- Webhook `secret_token` bilan himoyalangan; CRUD faqat `TELEGRAM_ADMIN_ID` uchun
