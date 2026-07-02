"use client";

import { useTranslations } from "next-intl";
import type { Profile } from "@/lib/types";

export default function Footer({ profile }: { profile: Profile }) {
  const t = useTranslations("footer");

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
    <footer className="border-t border-border-dim bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center sm:px-6">
        <p className="font-mono text-sm font-bold">
          <span className="text-accent">~/</span>codewithaziz
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted transition-colors hover:text-accent"
            >
              {l.label}
            </a>
          ))}
        </div>
        <p className="text-xs text-muted/80">{t("builtWith")}</p>
        <p className="text-xs text-muted/60">
          © {new Date().getFullYear()} {profile.name}. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
