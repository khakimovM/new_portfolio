"use client";

import { useTranslations } from "next-intl";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Skill } from "@/lib/types";

/** Lenta uzluksiz ko'rinishi uchun ro'yxatni kamida shu songacha takrorlaymiz */
const MIN_ITEMS = 12;

function fillRow(items: Skill[]): Skill[] {
  if (items.length === 0) return items;
  const row = [...items];
  while (row.length < MIN_ITEMS) row.push(...items);
  return row;
}

function MarqueeRow({ items, reverse }: { items: Skill[]; reverse?: boolean }) {
  const row = fillRow(items);
  // Bir xil ro'yxat 2 marta — animatsiya -50% ga yetganda ko'z ilg'amas ulanish
  const doubled = [...row, ...row];
  const duration = `${row.length * 2.6}s`;

  return (
    <div className="marquee-mask overflow-hidden py-2">
      <div
        className={`marquee-track flex w-max gap-4 ${reverse ? "reverse" : ""}`}
        style={{ "--marquee-duration": duration } as React.CSSProperties}
      >
        {doubled.map((s, i) => (
          <span
            key={`${s.id}-${i}`}
            className="rounded-full border border-border-dim bg-background px-6 py-3 font-mono text-sm whitespace-nowrap transition-all duration-300 hover:border-accent hover:text-accent hover:-translate-y-0.5"
          >
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Skills({ skills }: { skills: Skill[] }) {
  const t = useTranslations("skills");

  if (skills.length === 0) return null;

  // Ikki qatorga bo'lamiz: yuqorisi chapga, pastkisi o'ngga aylanadi
  const mid = Math.ceil(skills.length / 2);
  const topRow = skills.slice(0, mid);
  const bottomRow = skills.slice(mid);

  return (
    <section id="skills" className="bg-surface py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading kicker="stack" title={t("title")} subtitle={t("subtitle")} />
      </div>

      <div className="marquee-group space-y-2">
        <MarqueeRow items={topRow} />
        {bottomRow.length > 0 && <MarqueeRow items={bottomRow} reverse />}
      </div>
    </section>
  );
}
