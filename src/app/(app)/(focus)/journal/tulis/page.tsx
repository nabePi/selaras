import type { Metadata } from "next";
import { FocusHeader } from "@/components/focus-header";
import { Icon } from "@/components/icon";
import { MoodPrompt } from "@/components/mood-prompt";
import { ReflectionForm } from "@/components/reflection-form";
import { PENDING_REFLECTION as P } from "@/data/member";

export const metadata: Metadata = { title: "Tulis Jurnal" };

export default function TulisJurnalPage() {
  const progress = ((P.day / P.totalDays) * 100).toFixed(1);

  return (
    <>
      <FocusHeader title="Tulis Jurnal" backHref="/home" hideLogo />
      <div className="flex w-full flex-col pb-10">
        <div className="mb-4 flex flex-col gap-2 pt-2">
          <div className="flex items-center justify-end">
            <span className="t-label-sm inline-flex items-center gap-1 rounded-full bg-secondary-container px-2.5 py-1 text-on-secondary-container">
              <span className="size-1.5 animate-pulse rounded-full bg-accent-coral" />
              Tertunda
            </span>
          </div>

          <div className="mt-1 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="t-label-md font-semibold tracking-wide text-primary">
                SESI {P.session} · HARI KE-{P.day} DARI {P.totalDays} HARI
              </span>
              <span className="t-body-sm text-text-muted">{P.dateLabel}</span>
            </div>
            <div
              role="progressbar"
              aria-label="Progres hari refleksi"
              aria-valuemin={0}
              aria-valuemax={P.totalDays}
              aria-valuenow={P.day}
              className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface-container"
            >
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <MoodPrompt />

        <section className="relative mb-4 overflow-hidden rounded-3xl bg-surface-container-low p-5 shadow-sm">
          <div className="pointer-events-none absolute -top-8 -right-8 size-28 rounded-full bg-surface-container-high opacity-60 blur-2xl" />
          <div className="relative z-10 flex flex-col gap-2">
            <span className="t-label-sm inline-flex items-center gap-1.5 self-start rounded-full bg-sage-tint px-3 py-1 text-primary">
              <Icon name="spa" size={15} filled />
              Prompt Kurasi Coach
            </span>
            <h2 className="t-headline-md leading-snug text-on-surface">{P.prompt}</h2>
            <div className="flex items-start gap-2 pt-1">
              <Icon name="format_quote" size={18} className="mt-0.5 shrink-0 text-sage-medium" />
              <p className="t-quote leading-relaxed text-on-surface-variant italic">
                {P.promptNote}
              </p>
            </div>
          </div>
        </section>

        <ReflectionForm draftKey={`selaras:draft:sesi-${P.session}-hari-${P.day}`} />
      </div>
    </>
  );
}
