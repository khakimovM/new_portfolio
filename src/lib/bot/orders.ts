import { Bot, Context, InlineKeyboard } from "grammy";
import { supabaseAdmin } from "@/lib/supabase";
import type { Order, Profile } from "@/lib/types";
import { esc, isAdminId } from "./format";

function adminId(): number {
  return Number(process.env.TELEGRAM_ADMIN_ID);
}

function orderSummary(o: Order): string {
  return (
    `👤 <b>Ism:</b> ${esc(o.client_name)}\n` +
    `📞 <b>Telefon:</b> ${esc(o.client_phone)}\n` +
    `📝 <b>Loyiha:</b> ${esc(o.description)}`
  );
}

/** Saytdagi formadan kelgan mijoz: /start order_<token> */
export async function handleOrderStart(ctx: Context, token: string): Promise<void> {
  const chatId = ctx.chat!.id;
  const sb = supabaseAdmin();

  const { data } = await sb.from("orders").select("*").eq("token", token).maybeSingle();
  const order = data as Order | null;

  if (!order) {
    await ctx.reply("❌ Buyurtma topilmadi yoki muddati o'tgan. Iltimos, saytdan qaytadan yuboring.");
    return;
  }

  if (order.status !== "draft") {
    const msg =
      order.status === "pending"
        ? "⏳ Bu buyurtma allaqachon yuborilgan. Admin javobini kuting."
        : "ℹ️ Bu buyurtma allaqachon ko'rib chiqilgan.";
    await ctx.reply(msg);
    return;
  }

  // Keyin javob yuborish uchun mijoz chat ID'sini saqlaymiz
  await sb.from("orders").update({ client_chat_id: chatId }).eq("id", order.id);

  const kb = new InlineKeyboard()
    .text("✅ Tasdiqlash", `oc:${order.id}`)
    .text("❌ Bekor qilish", `ox:${order.id}`);

  await ctx.reply(
    `📋 <b>Buyurtmangizni tekshiring:</b>\n\n${orderSummary(order)}\n\n` +
      `Hammasi to'g'ri bo'lsa, <b>Tasdiqlash</b> tugmasini bosing — buyurtma adminga yuboriladi.`,
    { parse_mode: "HTML", reply_markup: kb }
  );
}

export function registerOrderHandlers(bot: Bot): void {
  // Mijoz tasdiqladi → adminga bildirishnoma
  bot.callbackQuery(/^oc:(.+)$/, async (ctx) => {
    const id = ctx.match[1];
    const sb = supabaseAdmin();
    const { data } = await sb.from("orders").select("*").eq("id", id).maybeSingle();
    const order = data as Order | null;

    if (!order || order.status !== "draft" || order.client_chat_id !== ctx.from.id) {
      await ctx.answerCallbackQuery({ text: "Buyurtma topilmadi yoki eskirgan." });
      return;
    }

    await sb.from("orders").update({ status: "pending" }).eq("id", id);
    await ctx.answerCallbackQuery({ text: "Yuborildi!" });
    await ctx.editMessageText(
      `✅ <b>Buyurtmangiz yuborildi!</b>\n\n${orderSummary(order)}\n\n` +
        `Admin ko'rib chiqib tez orada javob beradi. Bu chatda xabar olasiz. ⏳`,
      { parse_mode: "HTML" }
    );

    const kb = new InlineKeyboard()
      .text("✅ Qabul qilish", `oa:${order.id}`)
      .text("❌ Rad etish", `or:${order.id}`);
    await ctx.api.sendMessage(
      adminId(),
      `🔔 <b>Sizga yangi zakaz qo'shildi!</b>\n\n${orderSummary(order)}`,
      { parse_mode: "HTML", reply_markup: kb }
    );
  });

  // Mijoz bekor qildi
  bot.callbackQuery(/^ox:(.+)$/, async (ctx) => {
    const id = ctx.match[1];
    const sb = supabaseAdmin();
    const { data } = await sb.from("orders").select("*").eq("id", id).maybeSingle();
    const order = data as Order | null;

    if (!order || order.status !== "draft" || order.client_chat_id !== ctx.from.id) {
      await ctx.answerCallbackQuery({ text: "Buyurtma topilmadi." });
      return;
    }

    await sb.from("orders").update({ status: "cancelled" }).eq("id", id);
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      "❌ Buyurtma bekor qilindi. Xohlasangiz saytdan qaytadan yuborishingiz mumkin."
    );
  });

  // Admin qabul qildi → mijozga kontaktlar
  bot.callbackQuery(/^oa:(.+)$/, async (ctx) => {
    if (!isAdminId(ctx.from.id)) {
      await ctx.answerCallbackQuery({ text: "Ruxsat yo'q." });
      return;
    }
    const id = ctx.match[1];
    const sb = supabaseAdmin();
    const { data } = await sb.from("orders").select("*").eq("id", id).maybeSingle();
    const order = data as Order | null;

    if (!order || order.status !== "pending") {
      await ctx.answerCallbackQuery({ text: "Buyurtma topilmadi yoki allaqachon ko'rilgan." });
      return;
    }

    await sb.from("orders").update({ status: "accepted" }).eq("id", id);
    await ctx.answerCallbackQuery({ text: "Qabul qilindi!" });
    await ctx.editMessageText(
      `✅ <b>Qabul qilindi</b>\n\n${orderSummary(order)}`,
      { parse_mode: "HTML" }
    );

    if (order.client_chat_id) {
      const { data: p } = await sb.from("profile").select("*").eq("id", 1).maybeSingle();
      const profile = p as Profile | null;
      const contacts = [
        profile?.telegram_username ? `Telegram: @${esc(profile.telegram_username)}` : null,
        profile?.phone ? `Telefon: ${esc(profile.phone)}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      await ctx.api.sendMessage(
        order.client_chat_id,
        `🎉 <b>Sizning zakazingiz qabul qilindi!</b>\n\n` +
          (contacts ? `Bog'lanish uchun:\n${contacts}\n\n` : "") +
          `Tez orada siz bilan bog'lanishadi. Rahmat! 🤝`,
        { parse_mode: "HTML" }
      );
    }
  });

  // Admin rad etdi → mijozga muloyim javob
  bot.callbackQuery(/^or:(.+)$/, async (ctx) => {
    if (!isAdminId(ctx.from.id)) {
      await ctx.answerCallbackQuery({ text: "Ruxsat yo'q." });
      return;
    }
    const id = ctx.match[1];
    const sb = supabaseAdmin();
    const { data } = await sb.from("orders").select("*").eq("id", id).maybeSingle();
    const order = data as Order | null;

    if (!order || order.status !== "pending") {
      await ctx.answerCallbackQuery({ text: "Buyurtma topilmadi yoki allaqachon ko'rilgan." });
      return;
    }

    await sb.from("orders").update({ status: "rejected" }).eq("id", id);
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      `❌ <b>Rad etildi</b>\n\n${orderSummary(order)}`,
      { parse_mode: "HTML" }
    );

    if (order.client_chat_id) {
      await ctx.api.sendMessage(
        order.client_chat_id,
        `😔 Afsuski, hozircha buyurtmangizni qabul qila olmayman.\n` +
          `Vaqt ajratganingiz uchun rahmat! Keyinroq qaytadan murojaat qilishingiz mumkin.`
      );
    }
  });
}

/** Admin menyusi uchun: kutilayotgan zakazlar ro'yxati */
export async function sendPendingOrders(ctx: Context): Promise<void> {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("orders")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(10);
  const orders = (data ?? []) as Order[];

  if (orders.length === 0) {
    await ctx.reply("📋 Hozircha kutilayotgan zakazlar yo'q.");
    return;
  }

  for (const o of orders) {
    const kb = new InlineKeyboard()
      .text("✅ Qabul qilish", `oa:${o.id}`)
      .text("❌ Rad etish", `or:${o.id}`);
    await ctx.reply(`📋 <b>Zakaz</b>\n\n${orderSummary(o)}`, {
      parse_mode: "HTML",
      reply_markup: kb,
    });
  }
}
