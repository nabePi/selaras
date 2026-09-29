"use client";

import { useState } from "react";
import { Icon } from "./icon";

const BARS = [
  ["h-2", "bg-primary/40"],
  ["h-3", "bg-primary/70"],
  ["h-1.5", "bg-primary/30"],
  ["h-3.5", "bg-primary"],
  ["h-2", "bg-primary/50"],
  ["h-1", "bg-primary/30"],
  ["h-2.5", "bg-primary/60"],
  ["h-3", "bg-primary/80"],
  ["h-1.5", "bg-primary/30"],
  ["h-2", "bg-primary/50"],
];

export function MiniAudioPlayer({
  title,
  duration,
}: {
  title: string;
  duration: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface-container-high p-3">
      <button
        type="button"
        aria-label={playing ? "Jeda audio refleksi" : "Putar audio refleksi"}
        onClick={() => setPlaying((p) => !p)}
        className={`flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm ${
          playing ? "animate-pulse" : ""
        }`}
      >
        <Icon name={playing ? "pause" : "play_arrow"} size={20} />
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="t-label-sm flex items-center justify-between text-on-surface">
          <span className="truncate font-medium">{title}</span>
          <span className="ml-2 shrink-0 text-[10px] text-text-muted">
            {duration}
          </span>
        </div>
        <div aria-hidden="true" className="flex h-3.5 items-center gap-1">
          {BARS.map(([h, tone], i) => (
            <span key={i} className={`w-1 rounded-full ${h} ${tone}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
