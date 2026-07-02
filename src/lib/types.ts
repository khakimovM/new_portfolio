export type Profile = {
  id: number;
  name: string;
  title_en: string;
  title_uz: string;
  bio_en: string;
  bio_uz: string;
  hero_image_url: string | null;
  email: string | null;
  phone: string | null;
  github: string | null;
  linkedin: string | null;
  telegram_username: string | null;
  resume_url: string | null;
};

export type Project = {
  id: string;
  title: string;
  description_en: string;
  description_uz: string;
  image_url: string | null;
  tech_stack: string[];
  url: string;
  featured: boolean;
  published: boolean;
  sort_order: number;
};

export type SkillCategory = "frontend" | "backend" | "database" | "tools" | "other";

export type Skill = {
  id: string;
  name: string;
  category: SkillCategory;
  sort_order: number;
};

export type ExperienceType = "work" | "education" | "certificate";

export type Experience = {
  id: string;
  type: ExperienceType;
  title_en: string;
  title_uz: string;
  organization: string;
  description_en: string;
  description_uz: string;
  start_date: string;
  end_date: string | null;
  sort_order: number;
};

export type OrderStatus = "draft" | "pending" | "accepted" | "rejected" | "cancelled";

export type Order = {
  id: string;
  token: string;
  client_name: string;
  client_phone: string;
  description: string;
  client_chat_id: number | null;
  status: OrderStatus;
  created_at: string;
};

export type Locale = "en" | "uz";

/** Bazadagi `_en`/`_uz` ustunlardan joriy til bo'yicha qiymat oladi */
export function localized<T extends Record<string, unknown>>(
  row: T,
  field: string,
  locale: Locale
): string {
  return String(row[`${field}_${locale}`] ?? row[`${field}_en`] ?? "");
}
