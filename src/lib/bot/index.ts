import { Bot } from "grammy";
import { isAdminId } from "./format";
import { clearSession } from "./sessions";
import { registerAdminHandlers, sendMainMenu } from "./admin";
import { handleOrderStart, registerOrderHandlers } from "./orders";

let bot: Bot | null = null;

/** Bitta bot instansi (serverless warm start'larda qayta ishlatiladi) */
export function getBot(): Bot {
  if (bot) return bot;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");

  bot = new Bot(token);

  bot.command("start", async (ctx) => {
    const payload = ctx.match;

    // Saytdagi formadan kelgan mijoz: /start order_<token>
    if (typeof payload === "string" && payload.startsWith("order_")) {
      await handleOrderStart(ctx, payload.slice("order_".length));
      return;
    }

    if (isAdminId(ctx.from?.id)) {
      await sendMainMenu(ctx);
      return;
    }

    await ctx.reply(
      "👋 Salom! Bu codewithaziz.uz portfolio boti.\n\n" +
        "Loyiha buyurtma qilish uchun saytdagi formadan foydalaning:\n" +
        "https://codewithaziz.uz"
    );
  });

  bot.command("menu", async (ctx) => {
    if (isAdminId(ctx.from?.id)) await sendMainMenu(ctx);
  });

  bot.command("cancel", async (ctx) => {
    if (!isAdminId(ctx.from?.id)) return;
    await clearSession(ctx.chat.id);
    await ctx.reply("❎ Amal bekor qilindi. Menyu: /start", {
      reply_markup: { remove_keyboard: true },
    });
  });

  // Zakaz callbacklari admin callbacklaridan oldin (prefikslar farqli, tartib muhim emas,
  // lekin mijoz oqimi admin guard'iga tushib qolmasligi uchun avval ro'yxatdan o'tadi)
  registerOrderHandlers(bot);
  registerAdminHandlers(bot);

  bot.catch((err) => {
    console.error("Bot error:", err.error);
  });

  return bot;
}
