/** HTML parse_mode uchun xavfsiz matn */
export function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function isAdminId(id: number | undefined): boolean {
  return Boolean(id && String(id) === process.env.TELEGRAM_ADMIN_ID);
}

export const SKILL_CATEGORIES = [
  "frontend",
  "backend",
  "database",
  "tools",
  "other",
] as const;

export const EXPERIENCE_TYPES = ["work", "education", "certificate"] as const;

/** "2024-05" yoki "2024-05-10" ni to'liq sanaga keltiradi, noto'g'ri bo'lsa null */
export function parseDate(input: string): string | null {
  const m = input.trim().match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (!m) return null;
  const [, y, mo, d] = m;
  const month = Number(mo);
  if (month < 1 || month > 12) return null;
  return `${y}-${mo}-${d ?? "01"}`;
}
