"use client";

import { useState } from "react";
import { Icon } from "./icon";

export function AudioPreview() {
  const [playing, setPlaying] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={playing}
      onClick={() => setPlaying((p) => !p)}
      className={`flex min-h-11 w-full items-center justify-between rounded-2xl px-4 py-2 text-primary shadow-sm transition-colors ${
        playing ? "bg-sage-tint" : "bg-canvas-cream hover:bg-canvas-ivory"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-full bg-sage-tint text-primary">
          <Icon name={playing ? "pause" : "play_arrow"} size={18} />
        </span>
        <span className="flex flex-col text-left">
          <span className="t-title-sm leading-tight text-on-surface">
            Dengarkan Renungan Pagi
          </span>
          <span className="t-body-sm text-text-muted">
            {playing
              ? "Memutar Renungan... 0:14 / 1:20"
              : "1 Menit Suara Lembut · Bersama Coach Afifah"}
          </span>
        </span>
      </span>
      <Icon name="graphic_eq" size={20} className="text-text-muted" />
    </button>
  );
}
