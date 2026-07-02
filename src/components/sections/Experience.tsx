"use client";

import { useRef } from "react";
import { motion, useScroll } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { localized, type Experience as Exp, type Locale } from "@/lib/types";

const TYPE_ICON: Record<Exp["type"], string> = {
  work: "💼",
  education: "🎓",
  certificate: "📜",
};

export default function Experience({ items }: { items: Exp[] }) {
  const t = useTranslations("experience");
  const locale = useLocale() as Locale;
  const listRef = useRef<HTMLDivElement>(null);

  // Timeline chizig'i scroll'ga qarab chiziladi
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 75%", "end 55%"],
  });

  if (items.length === 0) return null;

  // uz-UZ locale ko'p muhitlarda oy nomini "M01" qilib chiqaradi — o'zimiz yozamiz
  const UZ_MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];
  const fmt = (d: string) => {
    const date = new Date(d);
    if (locale === "uz") return `${UZ_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  };

  return (
    <section id="experience" className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
      <SectionHeading kicker="timeline" title={t("title")} subtitle={t("subtitle")} />

      <div ref={listRef} className="relative ml-3 pl-10 sm:ml-6">
        {/* fon chizig'i + scroll bilan chiziladigan chiziq */}
        <div className="absolute top-1 bottom-1 left-0 w-px bg-border-dim" />
        <motion.div
          className="absolute top-1 bottom-1 left-0 w-px origin-top bg-accent"
          style={{ scaleY: scrollYProgress }}
        />

        {items.map((item, i) => (
          <Reveal key={item.id} delay={i * 0.06} className="relative pb-10 last:pb-0">
            {/* timeline nuqtasi */}
            <motion.span
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.15 }}
              className="absolute top-2 -left-[52px] flex h-7 w-7 items-center justify-center rounded-full border border-accent/40 bg-background text-sm sm:-left-[52px]"
            >
              {TYPE_ICON[item.type]}
            </motion.span>

            <div className="rounded-2xl border border-border-dim bg-background p-6 transition-all duration-300 hover:border-accent/40 hover:shadow-[0_16px_40px_-20px_rgba(20,20,19,0.2)]">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h3 className="font-serif text-lg font-semibold">
                  {localized(item, "title", locale)}
                </h3>
                <span className="rounded-full bg-surface px-3 py-0.5 font-mono text-xs text-accent-2">
                  {t(`types.${item.type}`)}
                </span>
              </div>
              {item.organization && (
                <p className="mt-1 text-sm font-medium text-accent">{item.organization}</p>
              )}
              <p className="mt-1 font-mono text-xs text-muted">
                {fmt(item.start_date)} — {item.end_date ? fmt(item.end_date) : t("present")}
              </p>
              {localized(item, "description", locale) && (
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {localized(item, "description", locale)}
                </p>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
