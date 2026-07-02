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

  // Buyurtma saqlangach mijoz Telegram botga yo'naltiriladi (tasdiqlash uchun)
  useEffect(() => {
    if (state.status === "success" && state.link) {
      window.location.href = state.link;
    }
  }, [state]);

  const inputCls =
    "w-full rounded-xl border border-border-dim bg-background px-4 py-3.5 text-sm outline-none transition-all duration-300 placeholder:text-muted/50 focus:border-accent focus:shadow-[0_0_0_4px_rgba(217,119,87,0.12)]";

  return (
    <section id="order" className="bg-surface py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading kicker="contact" title={t("title")} subtitle={t("subtitle")} />

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Xizmatlar */}
          <div className="space-y-4">
            {(["frontend", "backend", "fullstack"] as const).map((key, i) => (
              <Reveal key={key} delay={i * 0.1}>
                <div className="flex items-start gap-4 rounded-2xl border border-border-dim bg-background p-6 transition-all duration-300 hover:border-accent/40 hover:-translate-y-0.5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/12 font-mono text-sm text-accent">
                    0{i + 1}
                  </span>
                  <p className="text-[15px] leading-relaxed">{t(`services.${key}`)}</p>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.3}>
              <div className="rounded-2xl border border-dashed border-accent/40 bg-background/60 p-6 font-mono text-xs leading-6 text-muted">
                <span className="text-accent">$</span> order --confirm via Telegram
                <br />
                <span className="text-muted/80">{t("form.hint")}</span>
              </div>
            </Reveal>
          </div>

          {/* Forma */}
          <Reveal delay={0.15}>
            <form
              action={formAction}
              className="space-y-5 rounded-3xl border border-border-dim bg-background p-8 shadow-[0_24px_60px_-30px_rgba(20,20,19,0.2)]"
            >
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium">
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
                <label htmlFor="phone" className="mb-2 block text-sm font-medium">
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
                <label htmlFor="description" className="mb-2 block text-sm font-medium">
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
                <p className="text-sm text-red-600">
                  {state.error === "required"
                    ? t("form.errorRequired")
                    : t("form.errorGeneric")}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="group w-full rounded-full bg-foreground px-7 py-4 text-sm font-semibold text-background transition-all duration-300 hover:bg-accent hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
              >
                {pending ? t("form.submitting") : t("form.submit")}
                <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
                  ✈
                </span>
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
