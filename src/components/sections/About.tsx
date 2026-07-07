"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import Reveal from "@/components/ui/Reveal";
import { localized, type Locale, type Profile } from "@/lib/types";

export default function About({ profile }: { profile: Profile }) {
  const t = useTranslations("about");
  const locale = useLocale() as Locale;
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const links = [
    profile.github && { label: "GitHub", href: profile.github },
    profile.linkedin && { label: "LinkedIn", href: profile.linkedin },
    profile.telegram_username && {
      label: "Telegram",
      href: `https://t.me/${profile.telegram_username}`,
    },
    profile.email && { label: "Email", href: `mailto:${profile.email}` },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <section ref={sectionRef} id="about" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Matn — telefonda birinchi, katta ekranda o'ngda */}
        <div className="lg:order-2">
          <Reveal>
            <p className="mb-3 font-mono text-xs font-semibold tracking-[0.2em] text-accent uppercase">
              {t("kicker")}
            </p>
            <h2 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              {t("title")}
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-7 text-lg leading-relaxed text-foreground/85">
              {localized(profile, "bio", locale)}
            </p>
          </Reveal>
          <Reveal delay={0.22}>
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-sm font-medium text-muted transition-colors hover:text-accent"
                >
                  {l.label}
                  <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5">
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Ikkinchi rasm — bej kartada, parallax; katta ekranda chapda */}
        <Reveal delay={0.1} className="lg:order-1">
          <motion.div style={{ y: imageY }} className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-3 -z-10 -rotate-2 rounded-[2rem] bg-surface-2" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-border-dim bg-surface">
              <Image
                src={profile.about_image_url ?? "/hero-placeholder.svg"}
                alt={profile.name}
                fill
                sizes="(max-width: 1024px) 90vw, 384px"
                className="object-cover"
              />
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
