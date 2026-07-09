import type { MetadataRoute } from "next";

const BASE_URL = "https://codewithaziz.uz";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { en: BASE_URL, uz: `${BASE_URL}/uz` };
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages },
    },
    {
      url: `${BASE_URL}/uz`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: { languages },
    },
  ];
}
