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
    <footer className="border-t border-border-dim bg-surface/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-center sm:px-6">
        <div className="flex flex-wrap justify-center gap-5">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-muted transition-colors hover:text-accent"
            >
              {l.label}
            </a>
          ))}
        </div>
        <p className="font-mono text-xs text-muted/70">{t("builtWith")}</p>
        <p className="font-mono text-xs text-muted/50">
          © {new Date().getFullYear()} {profile.name}. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
