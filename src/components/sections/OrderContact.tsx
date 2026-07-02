"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { createOrder, type OrderFormState } from "@/app/actions/order";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

const initialState: OrderFormState = { status: "idle" };

export default function OrderContact() {
  const t = useTranslations("order");
  const [state, formAction, pending] = useActionState(createOrder, initialState);

  // Zakaz saqlangach mijoz Telegram botga yo'naltiriladi (tasdiqlash uchun)
  useEffect(() => {
    if (state.status === "success" && state.link) {
      window.location.href = state.link;
    }
  }, [state]);

  const inputCls =
    "w-full rounded-lg border border-border-dim bg-surface-2 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted/50 focus:border-accent/60 focus:shadow-[0_0_16px_-8px_var(--accent)]";

  return (
    <section id="order" className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="absolute bottom-0 left-1/3 -z-10 h-72 w-72 rounded-full bg-accent-2/10 blur-[120px]" />

      <SectionHeading title={t("title")} subtitle={t("subtitle")} />

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Xizmatlar */}
        <Reveal>
          <div className="space-y-4">
            {(["frontend", "backend", "fullstack"] as const).map((key) => (
              <div
                key={key}
                className="flex items-start gap-3 rounded-xl border border-border-dim bg-surface p-5"
              >
                <span className="font-mono text-accent">▹</span>
                <p className="text-sm text-foreground">{t(`services.${key}`)}</p>
              </div>
            ))}
            <div className="rounded-xl border border-dashed border-accent-2/40 bg-surface p-5 font-mono text-xs text-muted">
              <span className="text-accent-2">$</span> order --confirm via Telegram
              <br />
              <span className="text-muted/70">{t("form.hint")}</span>
            </div>
          </div>
        </Reveal>

        {/* Forma */}
        <Reveal delay={0.1}>
          <form
            action={formAction}
            className="space-y-4 rounded-xl border border-border-dim bg-surface p-6"
          >
            <div>
              <label htmlFor="name" className="mb-1.5 block font-mono text-xs text-muted">
                {t("form.name")} <span className="text-accent">*</span>
              </label>
              <input
                id="name"
                name="name"
                required
                maxLength={200}
                placeholder={t("form.namePlaceholder")}
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block font-mono text-xs text-muted">
                {t("form.phone")} <span className="text-accent">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                maxLength={50}
                placeholder={t("form.phonePlaceholder")}
                className={inputCls}
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-1.5 block font-mono text-xs text-muted"
              >
                {t("form.description")} <span className="text-accent">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                maxLength={2000}
                placeholder={t("form.descriptionPlaceholder")}
                className={inputCls}
              />
            </div>

            {state.status === "error" && (
              <p className="font-mono text-xs text-red-400">
                {state.error === "required"
                  ? t("form.errorRequired")
                  : t("form.errorGeneric")}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-gradient-to-r from-accent to-accent-2 px-6 py-3 font-mono text-sm font-bold text-background transition-all hover:brightness-110 hover:shadow-[0_0_28px_-6px_var(--accent-2)] disabled:opacity-60"
            >
              {pending ? t("form.submitting") : `✈ ${t("form.submit")}`}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
