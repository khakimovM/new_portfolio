"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
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
  const sectionRef = useRef<HTMLElement>(null);

  // Rasm scroll'da sekin siljiydi (parallax)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 70]);

  const stack = skills.slice(0, 6).map((s) => s.name).join(", ");
  const lines: TerminalLine[] = [
    { type: "cmd", text: t("terminalLines.whoami") },
    { type: "out", text: `${profile.name} — ${localized(profile, "title", locale)}`, color: "#e8b98f" },
    { type: "cmd", text: t("terminalLines.stack") },
    { type: "out", text: stack || "Next.js, Supabase, TypeScript" },
    { type: "cmd", text: t("terminalLines.status") },
    { type: "out", text: `✓ ${t("terminalLines.statusResult")}`, color: "#9dbb84" },
  ];

  const nameWords = profile.name.split(" ");

  return (
    <section ref={sectionRef} id="top" className="relative overflow-hidden pt-32 pb-20 sm:pt-40">
      {/* juda nozik apelsin nur */}
      <div className="absolute -top-24 right-[10%] -z-10 h-96 w-96 rounded-full bg-accent/10 blur-[130px]" />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Matn + terminal + tugmalar */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-mono text-sm font-semibold tracking-[0.2em] text-accent uppercase"
          >
            {t("greeting")}
          </motion.p>

          {/* Ism — so'zlar mask ichidan ko'tarilib chiqadi */}
          <h1 className="mt-4 font-serif text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            {nameWords.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
                <motion.span
                  className="inline-block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  {word}
                  {i < nameWords.length - 1 ? " " : ""}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-4 text-xl text-muted"
          >
            {localized(profile, "title", locale)}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="mt-9"
          >
            <TerminalWindow lines={lines} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            {profile.resume_url && (
              <a
                href={profile.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="group rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background transition-all duration-300 hover:bg-accent hover:scale-[1.03]"
              >
                {t("downloadCv")}
                <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-y-0.5">
                  ↓
                </span>
              </a>
            )}
            <a
              href="#order"
              className="group rounded-full border border-foreground/25 px-7 py-3.5 text-sm font-medium transition-all duration-300 hover:border-accent hover:text-accent hover:scale-[1.03]"
            >
              {t("orderCta")}
              <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </motion.div>
        </div>

        {/* Rasm — bej kartada, parallax bilan */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center"
        >
          <motion.div style={{ y: imageY }} className="relative w-full max-w-md">
            <div className="absolute -inset-3 -z-10 rotate-2 rounded-[2rem] bg-surface-2" />
            <div className="relative aspect-square overflow-hidden rounded-[1.75rem] border border-border-dim bg-surface">
              <Image
                src={profile.hero_image_url ?? "/hero-placeholder.svg"}
                alt={profile.name}
                fill
                sizes="(max-width: 1024px) 90vw, 448px"
                className="object-cover"
                priority
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
