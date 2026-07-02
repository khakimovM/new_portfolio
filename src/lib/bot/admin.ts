import { randomUUID } from "crypto";
import { revalidateTag as nextRevalidateTag } from "next/cache";

// Next 16'da revalidateTag profil talab qiladi; "max" — darhol yangilash
function revalidateTag(tag: string): void {
  nextRevalidateTag(tag, "max");
}
import { Bot, Context, InlineKeyboard } from "grammy";
import { supabaseAdmin } from "@/lib/supabase";
import type { Experience, Profile, Project, Skill } from "@/lib/types";
import { esc, isAdminId, parseDate, EXPERIENCE_TYPES, SKILL_CATEGORIES } from "./format";
import { clearSession, getSession, setSession, type Session } from "./sessions";
import { uploadTelegramFile } from "./storage";
import { sendPendingOrders } from "./orders";

// ---------------------------------------------------------------
// Yordamchilar
// ---------------------------------------------------------------

const PROJECT_FIELDS = {
  title: "title",
  den: "description_en",
  duz: "description_uz",
  tech: "tech_stack",
  url: "url",
} as const;

const PROFILE_FIELDS = [
  "name",
  "title_en",
  "title_uz",
  "bio_en",
  "bio_uz",
  "email",
  "phone",
  "github",
  "linkedin",
  "telegram_username",
] as const;

function guard(ctx: Context): boolean {
  return isAdminId(ctx.from?.id);
}

async function denyCallback(ctx: Context): Promise<void> {
  await ctx.answerCallbackQuery({ text: "Ruxsat yo'q." });
}

// ---------------------------------------------------------------
// Menyular
// ---------------------------------------------------------------

export async function sendMainMenu(ctx: Context): Promise<void> {
  const kb = new InlineKeyboard()
    .text("📁 Loyihalar", "m:projects")
    .text("🛠 Ko'nikmalar", "m:skills")
    .row()
    .text("💼 Tajriba", "m:experience")
    .text("👤 Profil", "m:profile")
    .row()
    .text("📋 Zakazlar", "m:orders");

  await ctx.reply(
    "🎛 <b>Portfolio boshqaruvi</b>\n\nBo'limni tanlang. Istalgan payt /cancel — amalni bekor qilish.",
    { parse_mode: "HTML", reply_markup: kb }
  );
}

async function sendProjectsMenu(ctx: Context): Promise<void> {
  const { data } = await supabaseAdmin()
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });
  const projects = (data ?? []) as Project[];

  const kb = new InlineKeyboard();
  for (const p of projects) {
    kb.text(`${p.published ? "" : "🙈 "}${p.title.slice(0, 40)}`, `p:v:${p.id}`).row();
  }
  kb.text("➕ Yangi loyiha", "p:add").row().text("⬅️ Orqaga", "m:main");

  await ctx.reply(
    `📁 <b>Loyihalar</b> (${projects.length} ta)\n\n🙈 — saytda ko'rinmaydi (unpublished)`,
    { parse_mode: "HTML", reply_markup: kb }
  );
}

async function sendProjectView(ctx: Context, id: string): Promise<void> {
  const { data } = await supabaseAdmin().from("projects").select("*").eq("id", id).maybeSingle();
  const p = data as Project | null;
  if (!p) {
    await ctx.reply("Loyiha topilmadi.");
    return;
  }

  const kb = new InlineKeyboard()
    .text("✏️ Nomi", `p:e:title:${id}`)
    .text("📝 Tavsif EN", `p:e:den:${id}`)
    .text("📝 Tavsif UZ", `p:e:duz:${id}`)
    .row()
    .text("🧩 Stack", `p:e:tech:${id}`)
    .text("🔗 URL", `p:e:url:${id}`)
    .text("🖼 Rasm", `p:e:img:${id}`)
    .row()
    .text(p.published ? "🙈 Yashirish" : "👁 Ko'rsatish", `p:pub:${id}`)
    .text("🗑 O'chirish", `p:del:${id}`)
    .row()
    .text("⬅️ Orqaga", "m:projects");

  await ctx.reply(
    `📁 <b>${esc(p.title)}</b> ${p.published ? "👁" : "🙈"}\n\n` +
      `🇬🇧 ${esc(p.description_en) || "—"}\n\n` +
      `🇺🇿 ${esc(p.description_uz) || "—"}\n\n` +
      `🧩 ${esc(p.tech_stack.join(", ")) || "—"}\n` +
      `🔗 ${esc(p.url)}\n` +
      `🖼 ${p.image_url ? "bor" : "yo'q"}`,
    { parse_mode: "HTML", reply_markup: kb }
  );
}

async function sendSkillsMenu(ctx: Context): Promise<void> {
  const { data } = await supabaseAdmin()
    .from("skills")
    .select("*")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });
  const skills = (data ?? []) as Skill[];

  const kb = new InlineKeyboard();
  for (const s of skills) {
    kb.text(`🗑 ${s.name} (${s.category})`, `s:del:${s.id}`).row();
  }
  kb.text("➕ Yangi skill", "s:add").row().text("⬅️ Orqaga", "m:main");

  await ctx.reply(
    `🛠 <b>Ko'nikmalar</b> (${skills.length} ta)\n\nO'chirish uchun ustiga bosing.`,
    { parse_mode: "HTML", reply_markup: kb }
  );
}

async function sendExperienceMenu(ctx: Context): Promise<void> {
  const { data } = await supabaseAdmin()
    .from("experience")
    .select("*")
    .order("start_date", { ascending: false });
  const items = (data ?? []) as Experience[];

  const kb = new InlineKeyboard();
  for (const e of items) {
    kb.text(`🗑 ${e.title_en.slice(0, 40)}`, `e:del:${e.id}`).row();
  }
  kb.text("➕ Yangi tajriba", "e:add").row().text("⬅️ Orqaga", "m:main");

  await ctx.reply(
    `💼 <b>Tajriba</b> (${items.length} ta)\n\nO'chirish uchun ustiga bosing.`,
    { parse_mode: "HTML", reply_markup: kb }
  );
}

async function sendProfileMenu(ctx: Context): Promise<void> {
  const { data } = await supabaseAdmin().from("profile").select("*").eq("id", 1).maybeSingle();
  const p = data as Profile | null;

  const kb = new InlineKeyboard();
  const labels: Record<(typeof PROFILE_FIELDS)[number], string> = {
    name: "Ism",
    title_en: "Lavozim EN",
    title_uz: "Lavozim UZ",
    bio_en: "Bio EN",
    bio_uz: "Bio UZ",
    email: "Email",
    phone: "Telefon",
    github: "GitHub",
    linkedin: "LinkedIn",
    telegram_username: "TG username",
  };
  PROFILE_FIELDS.forEach((f, i) => {
    kb.text(`✏️ ${labels[f]}`, `pr:e:${f}`);
    if (i % 2 === 1) kb.row();
  });
  kb.row().text("🖼 Hero rasm", "pr:img").text("📄 CV (PDF)", "pr:cv");
  kb.row().text("⬅️ Orqaga", "m:main");

  await ctx.reply(
    `👤 <b>Profil</b>\n\n` +
      `Ism: ${esc(p?.name)}\n` +
      `Lavozim: ${esc(p?.title_en)} / ${esc(p?.title_uz)}\n` +
      `Email: ${esc(p?.email) || "—"}\n` +
      `Telefon: ${esc(p?.phone) || "—"}\n` +
      `TG: @${esc(p?.telegram_username) || "—"}\n` +
      `CV: ${p?.resume_url ? "bor ✅" : "yo'q ❌"}\n` +
      `Hero rasm: ${p?.hero_image_url ? "bor ✅" : "placeholder"}`,
    { parse_mode: "HTML", reply_markup: kb }
  );
}

// ---------------------------------------------------------------
// Handlerlar
// ---------------------------------------------------------------

export function registerAdminHandlers(bot: Bot): void {
  // --- Bo'lim menyulari ---
  bot.callbackQuery(/^m:(\w+)$/, async (ctx) => {
    if (!guard(ctx)) return denyCallback(ctx);
    await ctx.answerCallbackQuery();
    const section = ctx.match[1];
    if (section === "main") return sendMainMenu(ctx);
    if (section === "projects") return sendProjectsMenu(ctx);
    if (section === "skills") return sendSkillsMenu(ctx);
    if (section === "experience") return sendExperienceMenu(ctx);
    if (section === "profile") return sendProfileMenu(ctx);
    if (section === "orders") return sendPendingOrders(ctx);
  });

  // --- Loyihalar ---
  bot.callbackQuery(/^p:v:(.+)$/, async (ctx) => {
    if (!guard(ctx)) return denyCallback(ctx);
    await ctx.answerCallbackQuery();
    await sendProjectView(ctx, ctx.match[1]);
  });

  bot.callbackQuery("p:add", async (ctx) => {
    if (!guard(ctx)) return denyCallback(ctx);
    await ctx.answerCallbackQuery();
    await setSession(ctx.chat!.id, { flow: "add_project", step: 0, data: {} });
    await ctx.reply("➕ Yangi loyiha.\n\n1/6 — Loyiha <b>nomini</b> yozing:", {
      parse_mode: "HTML",
    });
  });

  bot.callbackQuery(/^p:e:(\w+):(.+)$/, async (ctx) => {
    if (!guard(ctx)) return denyCallback(ctx);
    await ctx.answerCallbackQuery();
    const [, field, id] = ctx.match;
    if (field === "img") {
      await setSession(ctx.chat!.id, { flow: "project_img", step: 0, data: { id } });
      await ctx.reply("🖼 Yangi rasmni yuboring (photo sifatida):");
      return;
    }
    await setSession(ctx.chat!.id, { flow: "edit_project", step: 0, data: { id, field } });
    const hints: Record<string, string> = {
      title: "Yangi nomni yozing:",
      den: "Yangi inglizcha tavsifni yozing:",
      duz: "Yangi o'zbekcha tavsifni yozing:",
      tech: "Stack'ni vergul bilan yozing (masalan: Next.js, Supabase):",
      url: "Yangi URL'ni yozing (production sayt yoki GitHub):",
    };
    await ctx.reply(`✏️ ${hints[field] ?? "Yangi qiymatni yozing:"}`);
  });

  bot.callbackQuery(/^p:pub:(.+)$/, async (ctx) => {
    if (!guard(ctx)) return denyCallback(ctx);
    const id = ctx.match[1];
    const sb = supabaseAdmin();
    const { data } = await sb.from("projects").select("published").eq("id", id).maybeSingle();
    if (data) {
      await sb.from("projects").update({ published: !data.published }).eq("id", id);
      revalidateTag("projects");
    }
    await ctx.answerCallbackQuery({ text: "Yangilandi." });
    await sendProjectView(ctx, id);
  });

  bot.callbackQuery(/^p:del:(.+)$/, async (ctx) => {
    if (!guard(ctx)) return denyCallback(ctx);
    await ctx.answerCallbackQuery();
    const id = ctx.match[1];
    const kb = new InlineKeyboard()
      .text("✅ Ha, o'chirilsin", `p:delc:${id}`)
      .text("❌ Yo'q", `p:v:${id}`);
    await ctx.reply("Rostdan ham o'chirilsinmi?", { reply_markup: kb });
  });

  bot.callbackQuery(/^p:delc:(.+)$/, async (ctx) => {
    if (!guard(ctx)) return denyCallback(ctx);
    await supabaseAdmin().from("projects").delete().eq("id", ctx.match[1]);
    revalidateTag("projects");
    await ctx.answerCallbackQuery({ text: "O'chirildi." });
    await sendProjectsMenu(ctx);
  });

  // --- Ko'nikmalar ---
  bot.callbackQuery("s:add", async (ctx) => {
    if (!guard(ctx)) return denyCallback(ctx);
    await ctx.answerCallbackQuery();
    await setSession(ctx.chat!.id, { flow: "add_skill", step: 0, data: {} });
    await ctx.reply("➕ Skill <b>nomini</b> yozing (masalan: React):", { parse_mode: "HTML" });
  });

  bot.callbackQuery(/^s:cat:(\w+)$/, async (ctx) => {
    if (!guard(ctx)) return denyCallback(ctx);
    const chatId = ctx.chat!.id;
    const session = await getSession(chatId);
    if (!session || session.flow !== "add_skill" || !session.data.name) {
      await ctx.answerCallbackQuery({ text: "Avval skill nomini yozing." });
      return;
    }
    await supabaseAdmin().from("skills").insert({
      name: String(session.data.name),
      category: ctx.match[1],
    });
    await clearSession(chatId);
    revalidateTag("skills");
    await ctx.answerCallbackQuery({ text: "Qo'shildi!" });
    await sendSkillsMenu(ctx);
  });

  bot.callbackQuery(/^s:del:(.+)$/, async (ctx) => {
    if (!guard(ctx)) return denyCallback(ctx);
    await supabaseAdmin().from("skills").delete().eq("id", ctx.match[1]);
    revalidateTag("skills");
    await ctx.answerCallbackQuery({ text: "O'chirildi." });
    await sendSkillsMenu(ctx);
  });

  // --- Tajriba ---
  bot.callbackQuery("e:add", async (ctx) => {
    if (!guard(ctx)) return denyCallback(ctx);
    await ctx.answerCallbackQuery();
    const kb = new InlineKeyboard();
    for (const t of EXPERIENCE_TYPES) kb.text(t, `e:type:${t}`);
    await ctx.reply("➕ Tajriba turini tanlang:", { reply_markup: kb });
  });

  bot.callbackQuery(/^e:type:(\w+)$/, async (ctx) => {
    if (!guard(ctx)) return denyCallback(ctx);
    await ctx.answerCallbackQuery();
    await setSession(ctx.chat!.id, {
      flow: "add_exp",
      step: 0,
      data: { type: ctx.match[1] },
    });
    await ctx.reply("1/7 — Lavozim/nom <b>inglizcha</b>:", { parse_mode: "HTML" });
  });

  bot.callbackQuery(/^e:del:(.+)$/, async (ctx) => {
    if (!guard(ctx)) return denyCallback(ctx);
    await supabaseAdmin().from("experience").delete().eq("id", ctx.match[1]);
    revalidateTag("experience");
    await ctx.answerCallbackQuery({ text: "O'chirildi." });
    await sendExperienceMenu(ctx);
  });

  // --- Profil ---
  bot.callbackQuery(/^pr:e:(\w+)$/, async (ctx) => {
    if (!guard(ctx)) return denyCallback(ctx);
    await ctx.answerCallbackQuery();
    const field = ctx.match[1];
    await setSession(ctx.chat!.id, { flow: "edit_profile", step: 0, data: { field } });
    await ctx.reply(`✏️ <b>${esc(field)}</b> uchun yangi qiymatni yozing:`, {
      parse_mode: "HTML",
    });
  });

  bot.callbackQuery("pr:img", async (ctx) => {
    if (!guard(ctx)) return denyCallback(ctx);
    await ctx.answerCallbackQuery();
    await setSession(ctx.chat!.id, { flow: "profile_img", step: 0, data: {} });
    await ctx.reply("🖼 Hero rasmni yuboring (photo sifatida):");
  });

  bot.callbackQuery("pr:cv", async (ctx) => {
    if (!guard(ctx)) return denyCallback(ctx);
    await ctx.answerCallbackQuery();
    await setSession(ctx.chat!.id, { flow: "profile_cv", step: 0, data: {} });
    await ctx.reply("📄 CV'ni PDF fayl (document) sifatida yuboring:");
  });

  // --- Matnli xabarlar (wizard qadamlari) ---
  bot.on("message:text", async (ctx) => {
    if (!guard(ctx)) return;
    const chatId = ctx.chat.id;
    const session = await getSession(chatId);
    if (!session) {
      await ctx.reply("Menyu uchun /start ni bosing.");
      return;
    }
    await handleAdminText(ctx, chatId, session, ctx.message.text.trim());
  });

  // --- Rasm ---
  bot.on("message:photo", async (ctx) => {
    if (!guard(ctx)) return;
    const chatId = ctx.chat.id;
    const session = await getSession(chatId);
    if (!session) return;

    const photos = ctx.message.photo;
    const fileId = photos[photos.length - 1].file_id; // eng katta o'lcham

    if (session.flow === "add_project" && session.step === 5) {
      const id = randomUUID();
      const url = await uploadTelegramFile(ctx.api, fileId, `projects/${id}.jpg`, "image/jpeg");
      await saveNewProject(ctx, chatId, session, id, url);
      return;
    }

    if (session.flow === "project_img") {
      const id = String(session.data.id);
      const url = await uploadTelegramFile(ctx.api, fileId, `projects/${id}.jpg`, "image/jpeg");
      await supabaseAdmin().from("projects").update({ image_url: url }).eq("id", id);
      await clearSession(chatId);
      revalidateTag("projects");
      await ctx.reply("✅ Rasm yangilandi!");
      await sendProjectView(ctx, id);
      return;
    }

    if (session.flow === "profile_img") {
      const url = await uploadTelegramFile(ctx.api, fileId, "profile/hero.jpg", "image/jpeg");
      await supabaseAdmin().from("profile").update({ hero_image_url: url }).eq("id", 1);
      await clearSession(chatId);
      revalidateTag("profile");
      await ctx.reply("✅ Hero rasm yangilandi!");
      return;
    }
  });

  // --- Hujjat (CV) ---
  bot.on("message:document", async (ctx) => {
    if (!guard(ctx)) return;
    const chatId = ctx.chat.id;
    const session = await getSession(chatId);
    if (!session || session.flow !== "profile_cv") return;

    const doc = ctx.message.document;
    if (doc.mime_type !== "application/pdf") {
      await ctx.reply("Iltimos, PDF fayl yuboring.");
      return;
    }
    const url = await uploadTelegramFile(ctx.api, doc.file_id, "profile/cv.pdf", "application/pdf");
    await supabaseAdmin().from("profile").update({ resume_url: url }).eq("id", 1);
    await clearSession(chatId);
    revalidateTag("profile");
    await ctx.reply("✅ CV yangilandi! Saytdagi «Download CV» endi yangi faylni beradi.");
  });
}

// ---------------------------------------------------------------
// Wizard matn qadamlari
// ---------------------------------------------------------------

async function handleAdminText(
  ctx: Context,
  chatId: number,
  session: Session,
  text: string
): Promise<void> {
  const sb = supabaseAdmin();

  // --- Yangi loyiha (6 qadam) ---
  if (session.flow === "add_project") {
    const d = session.data;
    switch (session.step) {
      case 0:
        d.title = text;
        await setSession(chatId, { ...session, step: 1, data: d });
        await ctx.reply("2/6 — Tavsif <b>inglizcha</b>:", { parse_mode: "HTML" });
        return;
      case 1:
        d.description_en = text;
        await setSession(chatId, { ...session, step: 2, data: d });
        await ctx.reply("3/6 — Tavsif <b>o'zbekcha</b>:", { parse_mode: "HTML" });
        return;
      case 2:
        d.description_uz = text;
        await setSession(chatId, { ...session, step: 3, data: d });
        await ctx.reply("4/6 — <b>Stack</b> (vergul bilan, masalan: Next.js, Supabase):", {
          parse_mode: "HTML",
        });
        return;
      case 3:
        d.tech_stack = text.split(",").map((s) => s.trim()).filter(Boolean);
        await setSession(chatId, { ...session, step: 4, data: d });
        await ctx.reply(
          "5/6 — <b>URL</b>: production sayt manzili, agar chiqmagan bo'lsa GitHub link:",
          { parse_mode: "HTML" }
        );
        return;
      case 4:
        if (!/^https?:\/\//.test(text)) {
          await ctx.reply("URL http(s):// bilan boshlanishi kerak. Qaytadan yozing:");
          return;
        }
        d.url = text;
        await setSession(chatId, { ...session, step: 5, data: d });
        await ctx.reply("6/6 — Loyiha <b>rasmini</b> yuboring yoki /skip deb yozing:", {
          parse_mode: "HTML",
        });
        return;
      case 5:
        if (text === "/skip") {
          await saveNewProject(ctx, chatId, session, randomUUID(), null);
        } else {
          await ctx.reply("Rasm yuboring yoki /skip deb yozing.");
        }
        return;
    }
  }

  // --- Loyiha maydonini tahrirlash ---
  if (session.flow === "edit_project") {
    const id = String(session.data.id);
    const short = String(session.data.field) as keyof typeof PROJECT_FIELDS;
    const column = PROJECT_FIELDS[short];
    if (!column) {
      await clearSession(chatId);
      return;
    }
    if (short === "url" && !/^https?:\/\//.test(text)) {
      await ctx.reply("URL http(s):// bilan boshlanishi kerak. Qaytadan yozing:");
      return;
    }
    const value =
      short === "tech" ? text.split(",").map((s) => s.trim()).filter(Boolean) : text;
    await sb.from("projects").update({ [column]: value }).eq("id", id);
    await clearSession(chatId);
    revalidateTag("projects");
    await ctx.reply("✅ Saqlandi!");
    return;
  }

  // --- Yangi skill: nomi (kategoriya keyin callback bilan) ---
  if (session.flow === "add_skill" && session.step === 0) {
    await setSession(chatId, { ...session, data: { name: text } });
    const kb = new InlineKeyboard();
    SKILL_CATEGORIES.forEach((c, i) => {
      kb.text(c, `s:cat:${c}`);
      if (i % 3 === 2) kb.row();
    });
    await ctx.reply(`«${esc(text)}» qaysi kategoriyaga kiradi?`, {
      parse_mode: "HTML",
      reply_markup: kb,
    });
    return;
  }

  // --- Yangi tajriba (7 qadam) ---
  if (session.flow === "add_exp") {
    const d = session.data;
    switch (session.step) {
      case 0:
        d.title_en = text;
        await setSession(chatId, { ...session, step: 1, data: d });
        await ctx.reply("2/7 — Lavozim/nom <b>o'zbekcha</b>:", { parse_mode: "HTML" });
        return;
      case 1:
        d.title_uz = text;
        await setSession(chatId, { ...session, step: 2, data: d });
        await ctx.reply("3/7 — Tashkilot nomi:");
        return;
      case 2:
        d.organization = text;
        await setSession(chatId, { ...session, step: 3, data: d });
        await ctx.reply("4/7 — Tavsif inglizcha (yoki /skip):");
        return;
      case 3:
        d.description_en = text === "/skip" ? "" : text;
        await setSession(chatId, { ...session, step: 4, data: d });
        await ctx.reply("5/7 — Tavsif o'zbekcha (yoki /skip):");
        return;
      case 4:
        d.description_uz = text === "/skip" ? "" : text;
        await setSession(chatId, { ...session, step: 5, data: d });
        await ctx.reply("6/7 — Boshlanish sanasi (YYYY-MM, masalan 2024-01):");
        return;
      case 5: {
        const date = parseDate(text);
        if (!date) {
          await ctx.reply("Sana formati noto'g'ri. YYYY-MM ko'rinishida yozing:");
          return;
        }
        d.start_date = date;
        await setSession(chatId, { ...session, step: 6, data: d });
        await ctx.reply("7/7 — Tugash sanasi (YYYY-MM) yoki hozirgacha bo'lsa «now»:");
        return;
      }
      case 6: {
        let end: string | null = null;
        if (text.toLowerCase() !== "now") {
          end = parseDate(text);
          if (!end) {
            await ctx.reply("Sana formati noto'g'ri. YYYY-MM yoki «now» deb yozing:");
            return;
          }
        }
        await sb.from("experience").insert({
          type: d.type,
          title_en: d.title_en,
          title_uz: d.title_uz,
          organization: d.organization,
          description_en: d.description_en ?? "",
          description_uz: d.description_uz ?? "",
          start_date: d.start_date,
          end_date: end,
        });
        await clearSession(chatId);
        revalidateTag("experience");
        await ctx.reply("✅ Tajriba qo'shildi!");
        return;
      }
    }
  }

  // --- Profil maydoni ---
  if (session.flow === "edit_profile") {
    const field = String(session.data.field);
    if (!(PROFILE_FIELDS as readonly string[]).includes(field)) {
      await clearSession(chatId);
      return;
    }
    // TG username @ bilan yozilsa tozalaymiz
    const value = field === "telegram_username" ? text.replace(/^@/, "") : text;
    await sb.from("profile").update({ [field]: value }).eq("id", 1);
    await clearSession(chatId);
    revalidateTag("profile");
    await ctx.reply("✅ Saqlandi!");
    return;
  }

  await ctx.reply("Tushunmadim. Menyu uchun /start, bekor qilish uchun /cancel.");
}

async function saveNewProject(
  ctx: Context,
  chatId: number,
  session: Session,
  id: string,
  imageUrl: string | null
): Promise<void> {
  const d = session.data;
  await supabaseAdmin().from("projects").insert({
    id,
    title: d.title,
    description_en: d.description_en ?? "",
    description_uz: d.description_uz ?? "",
    tech_stack: d.tech_stack ?? [],
    url: d.url,
    image_url: imageUrl,
    published: true,
  });
  await clearSession(chatId);
  revalidateTag("projects");
  await ctx.reply(`✅ «${esc(String(d.title))}» loyihasi qo'shildi va saytda ko'rinadi!`, {
    parse_mode: "HTML",
  });
}
