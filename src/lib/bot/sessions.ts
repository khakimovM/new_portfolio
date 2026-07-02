import { supabaseAdmin } from "@/lib/supabase";

// Serverless'da xotira saqlanmaydi — suhbat holati (wizard qadamlari)
// Supabase'dagi bot_sessions jadvalida turadi.

export type Session = {
  flow: string;
  step: number;
  data: Record<string, unknown>;
};

export async function getSession(chatId: number): Promise<Session | null> {
  const { data } = await supabaseAdmin()
    .from("bot_sessions")
    .select("state")
    .eq("chat_id", chatId)
    .maybeSingle();
  const state = data?.state as Session | undefined;
  return state && state.flow ? state : null;
}

export async function setSession(chatId: number, state: Session): Promise<void> {
  await supabaseAdmin()
    .from("bot_sessions")
    .upsert({ chat_id: chatId, state, updated_at: new Date().toISOString() });
}

export async function clearSession(chatId: number): Promise<void> {
  await supabaseAdmin().from("bot_sessions").delete().eq("chat_id", chatId);
}
