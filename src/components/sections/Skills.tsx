"use client";

import { useTranslations } from "next-intl";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Skill, SkillCategory } from "@/lib/types";

const CATEGORY_ORDER: SkillCategory[] = [
  "frontend",
  "backend",
  "database",
  "tools",
  "other",
];

export default function Skills({ skills }: { skills: Skill[] }) {
  const t = useTranslations("skills");

  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: skills.filter((s) => s.category === cat),
  })).filter((g) => g.items.length > 0);

  if (grouped.length === 0) return null;

  return (
    <section id="skills" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading title={t("title")} subtitle={t("subtitle")} />

      <div className="grid gap-6 sm:grid-cols-2">
        {grouped.map(({ cat, items }, i) => (
          <Reveal key={cat} delay={i * 0.08}>
            <div className="h-full rounded-xl border border-border-dim bg-surface p-6 transition-colors hover:border-accent/40">
              <h3 className="mb-4 font-mono text-sm text-accent">
                <span className="text-muted">{"//"}</span> {t(`categories.${cat}`)}
              </h3>
              <div className="flex flex-wrap gap-2">
                {items.map((s) => (
                  <span
                    key={s.id}
                    className="rounded-md border border-border-dim bg-surface-2 px-3 py-1.5 font-mono text-sm text-foreground transition-all hover:border-accent-2/60 hover:text-accent-2 hover:shadow-[0_0_16px_-6px_var(--accent-2)]"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
