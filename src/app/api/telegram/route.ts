import { NextRequest, NextResponse } from "next/server";
import { getBot } from "@/lib/bot";

export const dynamic = "force-dynamic";
// Telegram fayllarini yuklab olish/yuklash uchun yetarli vaqt
export const maxDuration = 60;

export async function POST(req: NextRequest): Promise<NextResponse> {
  // setWebhook'da berilgan secret_token'ni tekshiramiz — begona so'rovlar rad etiladi
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (!process.env.TELEGRAM_WEBHOOK_SECRET || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const update = await req.json();
    const bot = getBot();
    if (!bot.isInited()) await bot.init();
    await bot.handleUpdate(update);
  } catch (err) {
    // Telegram'ga 200 qaytaramiz, aks holda u update'ni qayta-qayta yuboraveradi
    console.error("Telegram webhook error:", err);
  }

  return NextResponse.json({ ok: true });
}
