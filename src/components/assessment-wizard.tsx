"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { ASSESSMENT_KINDS, ASSESSMENT_PARTS, ASSESSMENT_SETS, type AssessmentKind } from "@/data/assessment";

/** Satu pertanyaan per layar dengan indikator progres; jawaban belum disimpan (static). */
export function AssessmentWizard({ kind }: { kind: AssessmentKind }) {
  const items = ASSESSMENT_SETS[kind];
  const TOTAL = items.length;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(TOTAL).fill(null));

  if (step >= TOTAL) {
    return (
      <div className="flex w-full flex-col items-center gap-4 rounded-4xl bg-sage-tint p-6 text-center shadow-sm">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary text-on-primary">
          <Icon name="check" size={28} />
        </span>
        <h2 className="t-headline-sm text-on-surface">Terima kasih, {ASSESSMENT_KINDS[kind].title} selesai</h2>
        <p className="t-body-sm text-text-muted">
          {kind === "pre"
            ? "Jawabanmu menjadi titik awal perjalanan bertumbuhmu. Kamu akan melihat perubahannya setelah Sesi 4."
            : "Jawabanmu akan dibandingkan dengan Pre Assessment untuk melihat perjalanan bertumbuhmu."}
        </p>
        <Link
          href="/home"
          className="t-title-sm flex w-full items-center justify-center rounded-full bg-primary px-6 py-3.5 text-on-primary shadow-md transition-all active:scale-[0.99]"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const item = items[step];
  const part = ASSESSMENT_PARTS[item.part];
  const answer = answers[step];
  const isLast = step === TOTAL - 1;

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="t-label-sm font-semibold tracking-wider text-primary uppercase">
            {part.title} • {item.dimension}
          </span>
          <span className="t-label-sm text-text-muted">
            {step + 1} / {TOTAL}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={TOTAL}
          aria-valuenow={step + 1}
          className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high"
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((step + 1) / TOTAL) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="t-label-sm text-text-muted">{part.hint}</p>
        <h2 className="t-headline-sm leading-snug text-on-surface">{item.text}</h2>
      </div>

      <div className="flex flex-col gap-2" role="radiogroup" aria-label={item.text}>
        {part.scale.map((label, i) => {
          const selected = answer === i + 1;
          return (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setAnswers((a) => a.map((v, j) => (j === step ? i + 1 : v)))}
              className={`t-body-md flex items-center gap-3 rounded-2xl px-4 py-3 text-left shadow-sm transition-all active:scale-[0.99] ${
                selected
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-low text-on-surface"
              }`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  selected ? "bg-on-primary text-primary" : "bg-surface-container-highest"
                }`}
              >
                {i + 1}
              </span>
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 pt-1">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="t-title-sm flex items-center justify-center gap-1 rounded-full bg-surface-container-high px-5 py-3.5 text-on-surface transition-all active:scale-[0.99]"
          >
            <Icon name="arrow_back" size={18} />
            Kembali
          </button>
        )}
        <button
          type="button"
          disabled={answer === null}
          onClick={() => setStep(step + 1)}
          className="t-title-sm flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-on-primary shadow-md transition-all active:scale-[0.99] disabled:opacity-40"
        >
          <span>{isLast ? "Selesai" : "Lanjut"}</span>
          <Icon name={isLast ? "check" : "arrow_forward"} size={18} />
        </button>
      </div>
    </div>
  );
}
