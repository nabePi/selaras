"use client";

import { useState } from "react";
import { JOURNAL_FEELINGS } from "@/data/member";
import { SCALE_MAX, type PromptQuestion } from "@/data/journal-prompts";

type Answers = Record<string, string | number>;

const choiceClass = (active: boolean) =>
  `t-body-md flex items-center gap-3 rounded-2xl px-4 py-3 text-left shadow-xs transition-all active:scale-[0.99] ${
    active ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface"
  }`;

/**
 * Pertanyaan prompt jurnal sesuai tipe yang dibuat admin. Dipakai di /journal/tulis
 * dan di pratinjau form admin; jawaban belum disimpan (static).
 */
export function PromptQuestions({ questions }: { questions: PromptQuestion[] }) {
  const [answers, setAnswers] = useState<Answers>({});
  const set = (id: string, value: string | number) => setAnswers((a) => ({ ...a, [id]: value }));

  return (
    <ol className="flex flex-col gap-4">
      {questions.map((q, i) => (
        <li key={q.id} className="flex flex-col gap-3 rounded-3xl bg-surface-container-low p-5 shadow-sm">
          <h3 className="t-title-md leading-snug text-on-surface">
            <span className="mr-2 text-primary">{i + 1}.</span>
            {q.label.trim() || "Tulis pertanyaan…"}
          </h3>

          {q.type === "text" && (
            <textarea
              rows={3}
              value={(answers[q.id] as string) ?? ""}
              onChange={(e) => set(q.id, e.target.value)}
              aria-label={q.label}
              placeholder="Tulis jawabanmu di sini…"
              className="t-body-md w-full resize-none rounded-2xl bg-surface-container-lowest p-3.5 text-on-surface shadow-xs outline-none placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-primary"
            />
          )}

          {q.type === "scale" && (
            <div>
              <div role="radiogroup" aria-label={q.label} className="grid grid-cols-5 gap-2">
                {Array.from({ length: SCALE_MAX }, (_, n) => n + 1).map((n) => {
                  const active = answers[q.id] === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => set(q.id, n)}
                      className={`t-title-sm flex h-11 items-center justify-center rounded-full shadow-xs transition-all active:scale-95 ${
                        active ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface"
                      }`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
              <div className="t-label-sm mt-2 flex justify-between text-text-muted">
                <span>1 = Sangat rendah</span>
                <span>{SCALE_MAX} = Sangat tinggi</span>
              </div>
            </div>
          )}

          {q.type === "choice" && (
            <div role="radiogroup" aria-label={q.label} className="flex flex-col gap-2">
              {(q.options ?? [])
                .filter((o) => o.trim())
                .map((o) => {
                  const active = answers[q.id] === o;
                  return (
                    <button
                      key={o}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => set(q.id, o)}
                      className={choiceClass(active)}
                    >
                      <span
                        className={`size-4 shrink-0 rounded-full border-2 ${
                          active ? "border-on-primary bg-on-primary" : "border-outline-variant"
                        }`}
                      />
                      {o}
                    </button>
                  );
                })}
            </div>
          )}

          {q.type === "mood" && (
            <div
              role="radiogroup"
              aria-label={q.label}
              className="flex items-stretch justify-between gap-1.5 rounded-2xl bg-surface-bright p-2.5 shadow-xs"
            >
              {JOURNAL_FEELINGS.map((m) => {
                const active = answers[q.id] === m.label;
                return (
                  <button
                    key={m.label}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => set(q.id, m.label)}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 transition-all active:scale-95 ${
                      active ? "bg-primary shadow-sm" : "hover:bg-surface-container-low"
                    }`}
                  >
                    <span aria-hidden="true" className="text-2xl leading-none">
                      {m.emoji}
                    </span>
                    <span
                      className={`t-label-sm font-medium ${active ? "text-on-primary" : "text-text-muted"}`}
                    >
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
