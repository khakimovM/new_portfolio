"use client";

import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import ProjectCarousel from "@/components/ui/ProjectCarousel";
import SectionHeading from "@/components/ui/SectionHeading";
import { localized, type Locale, type Project } from "@/lib/types";

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Projects({ projects }: { projects: Project[] }) {
  const t = useTranslations("projects");
  const locale = useLocale() as Locale;

  if (projects.length === 0) return null;

  return (
    <section id="projects" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading kicker="portfolio" title={t("title")} subtitle={t("subtitle")} />

      <motion.div
        variants={gridVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {projects.map((p) => (
          <motion.div key={p.id} variants={cardVariants}>
            {/* Butun karta — link: production sayt yoki GitHub */}
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              draggable={false}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border-dim bg-background transition-all duration-400 hover:-translate-y-2 hover:border-accent/50 hover:shadow-[0_24px_50px_-20px_rgba(20,20,19,0.25)]"
            >
              <div className="relative h-44 w-full overflow-hidden bg-surface-2">
                {p.image_urls.length > 0 ? (
                  <ProjectCarousel images={p.image_urls} title={p.title} />
                ) : (
                  <div className="flex h-full items-center justify-center font-mono text-4xl text-border-dim transition-colors duration-500 group-hover:text-accent/40">
                    {"</>"}
                  </div>
                )}
                {p.featured && (
                  <span className="absolute top-3 right-3 rounded-full bg-accent px-3 py-1 font-mono text-xs font-semibold text-white">
                    ★ {t("featured")}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-serif text-xl font-semibold transition-colors duration-300 group-hover:text-accent">
                  {p.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {localized(p, "description", locale)}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-surface px-2.5 py-1 font-mono text-xs text-accent-2"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <span className="mt-5 text-sm font-medium text-muted transition-colors duration-300 group-hover:text-accent">
                  {t("visit")}
                  <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1.5">
                    →
                  </span>
                </span>
              </div>
            </a>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
