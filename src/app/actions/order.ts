"use server";

import { randomUUID } from "crypto";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase";

export type OrderFormState = {
  status: "idle" | "error" | "success";
  error?: "required" | "generic";
  /** Muvaffaqiyatda: mijoz yo'naltiriladigan Telegram deep-link */
  link?: string;
};

export async function createOrder(
  _prev: OrderFormState,
  formData: FormData
): Promise<OrderFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name || !phone || !description) {
    return { status: "error", error: "required" };
  }

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  if (!supabaseConfigured || !botUsername) {
    return { status: "error", error: "generic" };
  }

  // Deep-link token — Telegram start payload 64 belgigacha, faqat [A-Za-z0-9_-]
  const token = randomUUID().replace(/-/g, "");

  const { error } = await supabaseAdmin().from("orders").insert({
    token,
    client_name: name.slice(0, 200),
    client_phone: phone.slice(0, 50),
    description: description.slice(0, 2000),
    status: "draft",
  });

  if (error) {
    console.error("createOrder failed:", error.message);
    return { status: "error", error: "generic" };
  }

  return {
    status: "success",
    link: `https://t.me/${botUsername}?start=order_${token}`,
  };
}
