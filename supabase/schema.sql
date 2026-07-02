-- ============================================================
-- Portfolio sxemasi — Supabase SQL Editor'da bir marta ishga tushiring
-- ============================================================

-- 1) Jadvallar ---------------------------------------------------

create table if not exists profile (
  id int primary key default 1 check (id = 1), -- har doim bitta qator
  name text not null default 'Muxammadaziz Khakimov',
  title_en text not null default 'Full-Stack Developer',
  title_uz text not null default 'Full-Stack Dasturchi',
  bio_en text not null default '',
  bio_uz text not null default '',
  hero_image_url text,
  about_image_url text, -- "Men haqimda" bo'limi uchun ikkinchi rasm
  email text,
  phone text,
  github text,
  linkedin text,
  telegram_username text,
  resume_url text,
  updated_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description_en text not null default '',
  description_uz text not null default '',
  image_url text,
  tech_stack text[] not null default '{}',
  -- Bitta link: production sayt YOKI GitHub (agar deploy qilinmagan / yashirin bo'lsa)
  url text not null,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'other', -- frontend | backend | database | tools | other
  sort_order int not null default 0
);

create table if not exists experience (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'work', -- work | education | certificate
  title_en text not null,
  title_uz text not null,
  organization text not null default '',
  description_en text not null default '',
  description_uz text not null default '',
  start_date date not null,
  end_date date, -- null = hozirgacha
  sort_order int not null default 0
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  client_name text not null,
  client_phone text not null,
  description text not null,
  client_chat_id bigint,
  status text not null default 'draft', -- draft | pending | accepted | rejected | cancelled
  created_at timestamptz not null default now()
);

-- Telegram bot suhbat holati (serverless'da xotira saqlanmaydi)
create table if not exists bot_sessions (
  chat_id bigint primary key,
  state jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- 2) RLS — hammaga faqat o'qish, yozish faqat service role orqali ---

alter table profile enable row level security;
alter table projects enable row level security;
alter table skills enable row level security;
alter table experience enable row level security;
alter table orders enable row level security;
alter table bot_sessions enable row level security;

create policy "public read profile" on profile for select using (true);
create policy "public read published projects" on projects for select using (published = true);
create policy "public read skills" on skills for select using (true);
create policy "public read experience" on experience for select using (true);
-- orders va bot_sessions'ga anon kirish YO'Q (service role RLS'ni chetlab o'tadi)

-- 3) Storage bucket (rasmlar + CV) --------------------------------

insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

create policy "public read portfolio bucket"
on storage.objects for select
using (bucket_id = 'portfolio');

-- 4) Seed (boshlang'ich) ma'lumotlar -------------------------------

insert into profile (id, name, title_en, title_uz, bio_en, bio_uz, email, github, telegram_username, phone)
values (
  1,
  'Muxammadaziz Khakimov',
  'Full-Stack Developer',
  'Full-Stack Dasturchi',
  'I build fast, modern web applications — from landing pages to full-featured platforms with custom backends.',
  'Men tezkor va zamonaviy web-ilovalar yarataman — landing sahifalardan tortib to''liq platformalargacha.',
  'khakimovmukhammadaziz@gmail.com',
  'https://github.com/',
  'your_telegram_username',
  '+998 77 315 17 07'
)
on conflict (id) do nothing;

insert into skills (name, category, sort_order) values
  ('HTML/CSS', 'frontend', 1),
  ('JavaScript', 'frontend', 2),
  ('TypeScript', 'frontend', 3),
  ('React', 'frontend', 4),
  ('Next.js', 'frontend', 5),
  ('Tailwind CSS', 'frontend', 6),
  ('Node.js', 'backend', 1),
  ('Express.js', 'backend', 2),
  ('Nest.js', 'backend', 3),
  ('PostgreSQL', 'database', 1),
  ('MySQL', 'database', 2),
  ('MongoDB', 'database', 3),
  ('Redis', 'database', 4),
  ('Supabase', 'database', 5),
  ('Git/GitHub', 'tools', 1),
  ('Vercel', 'tools', 2);

insert into projects (title, description_en, description_uz, tech_stack, url, featured, sort_order) values
  (
    'codewithaziz.uz',
    'My personal dynamic portfolio — Next.js frontend, Supabase backend, fully managed through a Telegram bot.',
    'Shaxsiy dinamik portfoliom — Next.js frontend, Supabase backend, Telegram bot orqali boshqariladi.',
    array['Next.js','Supabase','Tailwind CSS','Telegram Bot API'],
    'https://codewithaziz.uz',
    true, 1
  );

insert into experience (type, title_en, title_uz, organization, description_en, description_uz, start_date, end_date, sort_order) values
  (
    'work',
    'Freelance Web Developer',
    'Freelance Web Dasturchi',
    'Self-employed',
    'Building websites and web applications for clients.',
    'Mijozlar uchun saytlar va web-ilovalar yarataman.',
    '2024-01-01', null, 1
  );
