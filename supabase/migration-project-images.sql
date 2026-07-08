-- ============================================================
-- Migratsiya: loyihalarga ko'p rasm (10 tagacha) qo'llab-quvvatlash
-- Supabase SQL Editor'da BIR MARTA ishga tushiring (deploy'dan OLDIN!)
-- ============================================================

-- 1) Yangi massiv ustuni
alter table projects
  add column if not exists image_urls text[] not null default '{}';

-- 2) Eski bitta rasmni massivga ko'chirish
update projects
set image_urls = array[image_url]
where image_url is not null
  and coalesce(array_length(image_urls, 1), 0) = 0;

-- 3) Ixtiyoriy: yangi kod deploy bo'lib, hammasi ishlayotganiga
--    ishonch hosil qilgach, eski ustunni o'chirishingiz mumkin:
-- alter table projects drop column if exists image_url;
