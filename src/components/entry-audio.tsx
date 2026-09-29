"use client";

import { useState } from "react";
import { Icon } from "./icon";

const BARS = ["h-3 bg-primary/60", "h-5 bg-primary", "h-2 bg-primary/40", "h-6 bg-primary", "h-4 bg-primary/80", "h-2.5 bg-primary/50"];

export function EntryAudio({ title, meta }: { title: string; meta: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="flex w-full items-center justify-between gap-2 rounded-xl bg-surface-container-low p-3">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          aria-label={playing ? `Jeda ${title}` : `Putar ${title}`}
          onClick={() => setPlaying((p) => !p)}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm transition-transform active:scale-95"
        >
          <Icon name={playing ? "pause" : "play_arrow"} size={20} />
        </button>
        <div className="flex min-w-0 flex-col">
          <span className="t-title-sm truncate text-on-surface">{title}</span>
          <span className="t-label-sm font-normal text-text-muted">{meta}</span>
        </div>
      </div>
      <div aria-hidden="true" className="flex h-6 shrink-0 items-end gap-0.5 px-2">
        {BARS.map((b, i) => (
          <span key={i} className={`w-1 rounded-full ${b} ${playing ? "animate-pulse" : ""}`} />
        ))}
      </div>
    </div>
  );
}
