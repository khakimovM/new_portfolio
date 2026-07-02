"use client";

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

  if (items.length === 0) return null;

  // uz-UZ locale ko'p muhitlarda oy nomini "M01" qilib chiqaradi — o'zimiz yozamiz
  const UZ_MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];
  const fmt = (d: string) => {
    const date = new Date(d);
    if (locale === "uz") return `${UZ_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  };

  return (
    <section id="experience" className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <SectionHeading title={t("title")} subtitle={t("subtitle")} />

      <div className="relative ml-3 border-l border-border-dim pl-8 sm:ml-6">
        {items.map((item, i) => (
          <Reveal key={item.id} delay={i * 0.06} className="relative pb-10 last:pb-0">
            {/* timeline nuqtasi */}
            <span className="absolute top-1 -left-[41px] flex h-6 w-6 items-center justify-center rounded-full border border-accent/50 bg-surface text-xs sm:-left-[41px]">
              {TYPE_ICON[item.type]}
            </span>

            <div className="rounded-xl border border-border-dim bg-surface p-5 transition-colors hover:border-accent/40">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h3 className="font-mono font-semibold">
                  {localized(item, "title", locale)}
                </h3>
                <span className="rounded bg-surface-2 px-2 py-0.5 font-mono text-xs text-accent-3">
                  {t(`types.${item.type}`)}
                </span>
              </div>
              {item.organization && (
                <p className="mt-1 text-sm text-accent-2">{item.organization}</p>
              )}
              <p className="mt-1 font-mono text-xs text-muted">
                {fmt(item.start_date)} — {item.end_date ? fmt(item.end_date) : t("present")}
              </p>
              {localized(item, "description", locale) && (
                <p className="mt-3 text-sm text-muted">
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
