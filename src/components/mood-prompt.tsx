"use client";

import { useState } from "react";
import { Icon } from "./icon";

const MOODS = [
  { emoji: "😢", label: "Sedih" },
  { emoji: "😟", label: "Cemas" },
  { emoji: "😐", label: "Biasa Saja" },
  { emoji: "😊", label: "Tenang" },
  { emoji: "😄", label: "Bahagia" },
] as const;

/** Prompt pembuka dari fasilitator: cek kondisi perasaan sebelum menulis refleksi. */
export function MoodPrompt() {
  const [mood, setMood] = useState<(typeof MOODS)[number]["label"] | null>(null);

  return (
    <section className="relative mb-4 overflow-hidden rounded-3xl bg-surface-container-low p-5 shadow-sm">
      <div className="pointer-events-none absolute -top-8 -right-8 size-28 rounded-full bg-surface-container-high opacity-60 blur-2xl" />
      <div className="relative z-10 flex flex-col gap-3">
        <span className="t-label-sm inline-flex items-center gap-1.5 self-start rounded-full bg-sage-tint px-3 py-1 text-primary">
          <Icon name="mood" size={15} filled />
          Prompt Kurasi Coach
        </span>
        <h2 className="t-headline-md leading-snug text-on-surface">
          Bagaimana perasaanmu hari ini?
        </h2>
        <div
          role="radiogroup"
          aria-label="Pilih perasaan hari ini"
          className="flex items-stretch justify-between gap-1.5 rounded-2xl bg-surface-bright p-2.5 shadow-xs"
        >
          {MOODS.map((m) => {
            const active = mood === m.label;
            return (
              <button
                key={m.label}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setMood(m.label)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 transition-all duration-200 active:scale-95 ${
                  active
                    ? "bg-primary shadow-sm"
                    : "hover:bg-surface-container-low"
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
      </div>
    </section>
  );
}
