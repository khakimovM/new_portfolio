import type { Experience, Profile, Project, Skill } from "./types";

// Supabase hali ulanmagan bo'lsa sayt shu ma'lumotlar bilan ko'rinadi (lokal dizayn uchun)

export const demoProfile: Profile = {
  id: 1,
  name: "Aziz Khakimov",
  title_en: "Full-Stack Developer",
  title_uz: "Full-Stack Dasturchi",
  bio_en:
    "I build fast, modern web applications — from landing pages to full-featured platforms with custom backends.",
  bio_uz:
    "Men tezkor va zamonaviy web-ilovalar yarataman — landing sahifalardan to'liq platformalargacha.",
  hero_image_url: null,
  about_image_url: null,
  email: "khakimovmukhammadaziz@gmail.com",
  phone: "+998 90 000 00 00",
  github: "https://github.com/",
  linkedin: null,
  telegram_username: "your_telegram_username",
  resume_url: null,
};

export const demoSkills: Skill[] = [
  { id: "1", name: "HTML/CSS", category: "frontend", sort_order: 1 },
  { id: "2", name: "JavaScript", category: "frontend", sort_order: 2 },
  { id: "3", name: "TypeScript", category: "frontend", sort_order: 3 },
  { id: "4", name: "React", category: "frontend", sort_order: 4 },
  { id: "5", name: "Next.js", category: "frontend", sort_order: 5 },
  { id: "6", name: "Tailwind CSS", category: "frontend", sort_order: 6 },
  { id: "7", name: "Node.js", category: "backend", sort_order: 1 },
  { id: "8", name: "PostgreSQL", category: "database", sort_order: 1 },
  { id: "9", name: "Supabase", category: "database", sort_order: 2 },
  { id: "10", name: "Git/GitHub", category: "tools", sort_order: 1 },
  { id: "11", name: "Vercel", category: "tools", sort_order: 2 },
];

export const demoProjects: Project[] = [
  {
    id: "1",
    title: "codewithaziz.uz",
    description_en:
      "My personal dynamic portfolio — Next.js frontend, Supabase backend, fully managed through a Telegram bot.",
    description_uz:
      "Shaxsiy dinamik portfoliom — Next.js frontend, Supabase backend, Telegram bot orqali boshqariladi.",
    image_url: null,
    tech_stack: ["Next.js", "Supabase", "Tailwind CSS", "Telegram Bot API"],
    url: "https://codewithaziz.uz",
    featured: true,
    published: true,
    sort_order: 1,
  },
];

export const demoExperience: Experience[] = [
  {
    id: "1",
    type: "work",
    title_en: "Freelance Web Developer",
    title_uz: "Freelance Web Dasturchi",
    organization: "Self-employed",
    description_en: "Building websites and web applications for clients.",
    description_uz: "Mijozlar uchun saytlar va web-ilovalar yarataman.",
    start_date: "2024-01-01",
    end_date: null,
    sort_order: 1,
  },
];
