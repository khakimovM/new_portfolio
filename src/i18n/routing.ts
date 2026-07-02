import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "uz"],
  defaultLocale: "en",
  // "/" — ingliz tili, "/uz" — o'zbek tili
  localePrefix: "as-needed",
});
