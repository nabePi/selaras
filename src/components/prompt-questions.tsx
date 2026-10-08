"use client";

import { useState } from "react";
import { moodOptionsOf } from "@/lib/mood";
import { richToPlain } from "@/lib/rich-text";
import { RichText } from "./rich-text";
import { scaleMaxOf, type PromptQuestion } from "@/data/journal-prompts";
import type { AnswerMap } from "@/lib/journal-types";

type Answers = AnswerMap;

const choiceClass = (active: boolean) =>
  `t-body-md flex items-center gap-3 rounded-2xl px-4 py-3 text-left shadow-xs transition-all active:scale-[0.99] ${
    active ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface"
  }`;

/**
 * Pertanyaan prompt jurnal sesuai tipe yang dibuat admin. Dipakai di form tulis jurnal
 * (terkendali lewat `answers` + `onAnswer`) dan di pratinjau admin (tanpa props: state lokal,
 * tidak disimpan).
 */
/** Kolom per baris: skala pendek satu baris, yang panjang dibagi rata agar tombol tidak terlalu sempit. */
const scaleColumns = (max: number) => (max <= 5 ? max : max === 6 ? 3 : max <= 8 ? 4 : 5);

export function PromptQuestions({
  questions,
  answers: controlled,
  onAnswer,
  errors,
}: {
  questions: PromptQuestion[];
  answers?: Answers;
  onAnswer?: (id: string, value: string | number) => void;
  errors?: Record<string, string>;
}) {
  const [local, setLocal] = useState<Answers>({});
  const answers = controlled ?? local;
  const set = (id: string, value: string | number) =>
    onAnswer ? onAnswer(id, value) : setLocal((a) => ({ ...a, [id]: value }));

  return (
    <ol className="flex flex-col gap-4">
      {questions.map((q, i) => (
        <li key={q.id} className="flex flex-col gap-3 rounded-3xl bg-surface-container-low p-5 shadow-sm">
          <div role="heading" aria-level={3} className="t-title-md flex gap-2 leading-snug text-on-surface">
            <span className="text-primary">{i + 1}.</span>
            <div className="min-w-0 flex-1">
              {richToPlain(q.label) ? <RichText value={q.label} /> : "Tulis pertanyaan…"}
              {q.type === "text" && q.required === false && (
                <span className="t-label-md font-normal text-text-muted">(opsional)</span>
              )}
            </div>
          </div>

          {q.type === "text" && (
            <textarea
              rows={3}
              value={(answers[q.id] as string) ?? ""}
              onChange={(e) => set(q.id, e.target.value)}
              aria-label={richToPlain(q.label)}
              placeholder={q.required === false ? "Boleh dikosongkan…" : "Tulis jawabanmu di sini…"}
              className="t-body-md w-full resize-none rounded-2xl bg-surface-container-lowest p-3.5 text-on-surface shadow-xs outline-none placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-primary"
            />
          )}

          {q.type === "scale" && (
            <div>
              <div
                role="radiogroup"
                aria-label={richToPlain(q.label)}
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${scaleColumns(scaleMaxOf(q))}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: scaleMaxOf(q) }, (_, n) => n + 1).map((n) => {
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
                <span>{scaleMaxOf(q)} = Sangat tinggi</span>
              </div>
            </div>
          )}

          {q.type === "choice" && (
            <div role="radiogroup" aria-label={richToPlain(q.label)} className="flex flex-col gap-2">
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
              aria-label={richToPlain(q.label)}
              className="flex flex-wrap items-stretch justify-between gap-1.5 rounded-2xl bg-surface-bright p-2.5 shadow-xs"
            >
              {moodOptionsOf(q).map((m) => {
                const active = answers[q.id] === m.label;
                return (
                  <button
                    key={m.label}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => set(q.id, m.label)}
                    className={`flex min-w-14 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2.5 transition-all active:scale-95 ${
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

          {errors?.[q.id] && (
            <p role="alert" className="t-body-sm text-error">
              {errors[q.id]}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
