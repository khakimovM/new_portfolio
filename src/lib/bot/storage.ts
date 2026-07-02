import type { Api } from "grammy";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Telegram'dan yuborilgan faylni yuklab olib Supabase Storage'ga qo'yadi
 * va public URL qaytaradi.
 */
export async function uploadTelegramFile(
  api: Api,
  fileId: string,
  destPath: string,
  contentType: string
): Promise<string> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");

  const file = await api.getFile(fileId);
  if (!file.file_path) throw new Error("Telegram did not return file_path");

  const res = await fetch(`https://api.telegram.org/file/bot${token}/${file.file_path}`);
  if (!res.ok) throw new Error(`Failed to download file: ${res.status}`);
  const buf = await res.arrayBuffer();

  const sb = supabaseAdmin();
  const { error } = await sb.storage
    .from("portfolio")
    .upload(destPath, buf, { upsert: true, contentType });
  if (error) throw new Error(error.message);

  const { data } = sb.storage.from("portfolio").getPublicUrl(destPath);
  // Keshni chetlab o'tish uchun versiya qo'shamiz (fayl nomi bir xil qolganda)
  return `${data.publicUrl}?v=${Date.now()}`;
}
