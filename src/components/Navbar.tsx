"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const sections = ["about", "skills", "projects", "experience"] as const;

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  // Pastga scroll'da yashirinadi, yuqoriga qaytganda chiqadi
  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(latest > prev && latest > 140 && !open);
  });

  return (
    <motion.header
      animate={{ y: hidden ? "-110%" : "0%" }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="fixed inset-x-0 top-0 z-50 border-b border-border-dim/70 bg-background/85 backdrop-blur-md"
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <a href="#top" className="font-mono text-base font-bold tracking-tight">
          <span className="text-accent">~/</span>codewithaziz
        </a>

        {/* Desktop */}
        <div className="hidden items-center gap-7 md:flex">
          {sections.map((s) => (
            <a
              key={s}
              href={`#${s}`}
              className="group relative text-sm text-muted transition-colors hover:text-foreground"
            >
              {t(s)}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <a
            href="#order"
            className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-all duration-300 hover:bg-accent hover:scale-[1.03]"
          >
            {t("order")}
          </a>
          <LangSwitcher locale={locale} pathname={pathname} />
        </div>

        {/* Mobile tugma */}
        <button
          className="text-2xl leading-none md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? "✕" : "≡"}
        </button>
      </nav>

      {/* Mobile menyu */}
      {open && (
        <div className="flex flex-col gap-1 border-t border-border-dim bg-background px-4 py-3 md:hidden">
          {sections.map((s) => (
            <a
              key={s}
              href={`#${s}`}
              onClick={() => setOpen(false)}
              className="py-2 text-sm text-muted hover:text-foreground"
            >
              {t(s)}
            </a>
          ))}
          <a
            href="#order"
            onClick={() => setOpen(false)}
            className="py-2 text-sm font-medium text-accent"
          >
            {t("order")}
          </a>
          <div className="pt-2">
            <LangSwitcher locale={locale} pathname={pathname} />
          </div>
        </div>
      )}
    </motion.header>
  );
}

function LangSwitcher({ locale, pathname }: { locale: string; pathname: string }) {
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-border-dim p-0.5 text-xs font-medium">
      {(["en", "uz"] as const).map((l) => (
        <Link
          key={l}
          href={pathname}
          locale={l}
          className={`rounded-full px-3 py-1 uppercase transition-colors ${
            locale === l
              ? "bg-foreground text-background"
              : "text-muted hover:text-foreground"
          }`}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}
