import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Supabase sozlanganmi — bo'lmasa sayt demo ma'lumot bilan ishlaydi */
export const supabaseConfigured = Boolean(url && anonKey);

/** Faqat o'qish uchun (anon key, RLS amal qiladi) */
export function supabasePublic(): SupabaseClient {
  if (!url || !anonKey) throw new Error("Supabase env vars are not set");
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

/** To'liq huquqli klient (service role) — FAQAT server kodida ishlatiladi */
export function supabaseAdmin(): SupabaseClient {
  if (!url || !serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
