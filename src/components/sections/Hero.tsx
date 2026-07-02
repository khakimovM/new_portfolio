"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import TerminalWindow, { type TerminalLine } from "@/components/ui/TerminalWindow";
import { localized, type Locale, type Profile, type Skill } from "@/lib/types";

export default function Hero({
  profile,
  skills,
}: {
  profile: Profile;
  skills: Skill[];
}) {
  const t = useTranslations("hero");
  const locale = useLocale() as Locale;

  const stack = skills.slice(0, 6).map((s) => s.name).join(", ");
  const lines: TerminalLine[] = [
    { type: "cmd", text: t("terminalLines.whoami") },
    { type: "out", text: `${profile.name} — ${localized(profile, "title", locale)}`, color: "var(--accent-2)" },
    { type: "cmd", text: t("terminalLines.stack") },
    { type: "out", text: stack || "Next.js, Supabase, TypeScript" },
    { type: "cmd", text: t("terminalLines.status") },
    { type: "out", text: `✓ ${t("terminalLines.statusResult")}`, color: "var(--accent)" },
  ];

  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-20 sm:pt-36">
      <div className="bg-grid absolute inset-0 -z-10" />
      {/* gradient nur dog'lari */}
      <div className="absolute -top-32 left-1/4 -z-10 h-72 w-72 rounded-full bg-accent/15 blur-[120px]" />
      <div className="absolute top-20 right-1/5 -z-10 h-72 w-72 rounded-full bg-accent-3/15 blur-[120px]" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        {/* Rasm */}
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="order-1 flex justify-center lg:order-none"
        >
          <div className="glow-ring relative aspect-square w-64 overflow-hidden rounded-2xl border border-border-dim sm:w-80 lg:w-96">
            <Image
              src={profile.hero_image_url ?? "/hero-placeholder.svg"}
              alt={profile.name}
              fill
              sizes="(max-width: 640px) 256px, (max-width: 1024px) 320px, 384px"
              className="object-cover"
              priority
            />
          </div>
        </motion.div>

        {/* Matn + terminal + tugmalar */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        >
          <p className="font-mono text-accent">{t("greeting")}</p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
            <span className="gradient-text">{profile.name}</span>
          </h1>
          <p className="mt-3 text-lg text-muted">{localized(profile, "bio", locale)}</p>

          <div className="mt-8">
            <TerminalWindow lines={lines} />
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            {profile.resume_url && (
              <a
                href={profile.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="rounded-lg bg-accent px-6 py-3 font-mono text-sm font-semibold text-background transition-all hover:brightness-110 hover:shadow-[0_0_28px_-6px_var(--accent)]"
              >
                ⬇ {t("downloadCv")}
              </a>
            )}
            <a
              href="#order"
              className="rounded-lg border border-accent-2/60 px-6 py-3 font-mono text-sm font-semibold text-accent-2 transition-all hover:bg-accent-2/10 hover:shadow-[0_0_28px_-6px_var(--accent-2)]"
            >
              {t("orderCta")} →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
