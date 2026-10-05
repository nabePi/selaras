import type { Metadata } from "next";
import { FocusHeader } from "@/components/focus-header";
import { Icon } from "@/components/icon";
import { PromptQuestions } from "@/components/prompt-questions";
import { ReflectionForm } from "@/components/reflection-form";
import { JOURNAL_PROMPTS, PENDING_PROMPT_DATE } from "@/data/journal-prompts";
import { PENDING_REFLECTION as P } from "@/data/member";

export const metadata: Metadata = { title: "Tulis Jurnal" };

export default function TulisJurnalPage() {
  // Static: prompt dipilih berdasarkan tanggal refleksi; nanti diambil dari prompt buatan admin.
  const prompt = JOURNAL_PROMPTS.find((p) => p.date === PENDING_PROMPT_DATE)!;
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

        <section className="mb-4 flex flex-col gap-2">
          <span className="t-label-sm inline-flex items-center gap-1.5 self-start rounded-full bg-sage-tint px-3 py-1 text-primary">
            <Icon name="spa" size={15} filled />
            Prompt Kurasi Coach
          </span>
          <h2 className="t-headline-md leading-snug text-on-surface">{prompt.title}</h2>
          {prompt.subtitle && <p className="t-body-md text-text-muted">{prompt.subtitle}</p>}
        </section>

        <div className="mb-4">
          <PromptQuestions questions={prompt.questions} />
        </div>

        <ReflectionForm draftKey={`selaras:draft:sesi-${P.session}-hari-${P.day}`} />
      </div>
    </>
  );
}
