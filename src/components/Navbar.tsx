"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const sections = ["skills", "projects", "experience"] as const;

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border-dim/60 bg-background/70 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#top" className="font-mono text-lg font-bold">
          <span className="text-accent">~/</span>codewithaziz
        </a>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          {sections.map((s) => (
            <a
              key={s}
              href={`#${s}`}
              className="font-mono text-sm text-muted transition-colors hover:text-accent"
            >
              {t(s)}
            </a>
          ))}
          <a
            href="#order"
            className="rounded-lg border border-accent/50 px-4 py-1.5 font-mono text-sm text-accent transition-all hover:bg-accent/10 hover:shadow-[0_0_20px_-6px_var(--accent)]"
          >
            {t("order")}
          </a>
          <LangSwitcher locale={locale} pathname={pathname} />
        </div>

        {/* Mobile tugma */}
        <button
          className="font-mono text-xl md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? "✕" : "≡"}
        </button>
      </nav>

      {/* Mobile menyu */}
      {open && (
        <div className="flex flex-col gap-1 border-t border-border-dim bg-surface px-4 py-3 md:hidden">
          {sections.map((s) => (
            <a
              key={s}
              href={`#${s}`}
              onClick={() => setOpen(false)}
              className="py-2 font-mono text-sm text-muted hover:text-accent"
            >
              {t(s)}
            </a>
          ))}
          <a
            href="#order"
            onClick={() => setOpen(false)}
            className="py-2 font-mono text-sm text-accent"
          >
            {t("order")}
          </a>
          <div className="pt-2">
            <LangSwitcher locale={locale} pathname={pathname} />
          </div>
        </div>
      )}
    </header>
  );
}

function LangSwitcher({ locale, pathname }: { locale: string; pathname: string }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border-dim p-0.5 font-mono text-xs">
      {(["en", "uz"] as const).map((l) => (
        <Link
          key={l}
          href={pathname}
          locale={l}
          className={`rounded-md px-2.5 py-1 uppercase transition-colors ${
            locale === l ? "bg-accent/15 text-accent" : "text-muted hover:text-foreground"
          }`}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}
