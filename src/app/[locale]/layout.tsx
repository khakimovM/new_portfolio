import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getProfile } from "@/lib/data";
import SmoothScroll from "@/components/SmoothScroll";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://codewithaziz.uz";

// Ism qidiruvda qanday yozilishidan qat'i nazar topilishi uchun barcha imlo variantlari
const NAME_VARIANTS = [
  "Mukhammadaziz Khakimov",
  "Khakimov Mukhammadaziz",
  "Muxammadaziz Xakimov",
  "Xakimov Muxammadaziz",
  "Muxammadaziz Khakimov",
  "Aziz Khakimov",
  "Aziz Xakimov",
  "Mukhammadaziz",
  "Muxammadaziz",
  "Khakimov",
  "Xakimov",
  "codewithaziz",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const path = locale === "uz" ? "/uz" : "/";

  return {
    metadataBase: new URL(BASE_URL),
    title: t("title"),
    description: t("description"),
    keywords: [...NAME_VARIANTS, "Full-Stack Developer", "web developer Uzbekistan", "web dasturchi"],
    authors: [{ name: "Mukhammadaziz Khakimov", url: BASE_URL }],
    creator: "Mukhammadaziz Khakimov",
    alternates: {
      canonical: path,
      languages: { en: "/", uz: "/uz", "x-default": "/" },
    },
    openGraph: {
      type: "website",
      url: path,
      siteName: "codewithaziz.uz",
      title: t("title"),
      description: t("description"),
      locale: locale === "uz" ? "uz_UZ" : "en_US",
      alternateLocale: locale === "uz" ? "en_US" : "uz_UZ",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: t("title") }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/og.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  // JSON-LD: Google'ga ismning barcha imlo variantlarini tanitadigan Person sxemasi
  const profile = await getProfile();
  const sameAs = [
    profile.github,
    profile.linkedin,
    profile.telegram_username ? `https://t.me/${profile.telegram_username}` : null,
  ].filter(Boolean);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${BASE_URL}/#person`,
        name: "Mukhammadaziz Khakimov",
        alternateName: NAME_VARIANTS,
        url: BASE_URL,
        image: `${BASE_URL}/og.png`,
        jobTitle: "Full-Stack Developer",
        ...(profile.email ? { email: `mailto:${profile.email}` } : {}),
        sameAs,
        knowsAbout: [
          "Next.js",
          "React",
          "TypeScript",
          "Node.js",
          "Supabase",
          "PostgreSQL",
          "Telegram Bot API",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: "codewithaziz.uz",
        alternateName: ["codewithaziz", "Code With Aziz"],
        inLanguage: ["en", "uz"],
        publisher: { "@id": `${BASE_URL}/#person` },
      },
    ],
  };

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
