"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { localized, type Locale, type Project } from "@/lib/types";

export default function Projects({ projects }: { projects: Project[] }) {
  const t = useTranslations("projects");
  const locale = useLocale() as Locale;

  if (projects.length === 0) return null;

  return (
    <section id="projects" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading title={t("title")} subtitle={t("subtitle")} />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 0.08}>
            {/* Butun karta — link: production sayt yoki GitHub */}
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-border-dim bg-surface transition-all hover:-translate-y-1.5 hover:border-accent/50 hover:shadow-[0_12px_40px_-12px_rgba(52,211,153,0.25)]"
            >
              <div className="relative h-44 w-full overflow-hidden bg-surface-2">
                {p.image_url ? (
                  <Image
                    src={p.image_url}
                    alt={p.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-mono text-4xl text-border-dim">
                    {"</>"}
                  </div>
                )}
                {p.featured && (
                  <span className="absolute top-3 right-3 rounded-md bg-accent/90 px-2 py-0.5 font-mono text-xs font-semibold text-background">
                    ★ {t("featured")}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-mono text-lg font-semibold transition-colors group-hover:text-accent">
                  {p.title}
                </h3>
                <p className="mt-2 flex-1 text-sm text-muted">
                  {localized(p, "description", locale)}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded bg-surface-2 px-2 py-0.5 font-mono text-xs text-accent-2"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <span className="mt-4 font-mono text-xs text-muted transition-colors group-hover:text-accent">
                  {t("visit")} ↗
                </span>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
