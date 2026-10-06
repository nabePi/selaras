"use client";

import { useRef, useState } from "react";
import { Icon } from "./icon";

const BARS = ["h-3 bg-primary/60", "h-5 bg-primary", "h-2 bg-primary/40", "h-6 bg-primary", "h-4 bg-primary/80", "h-2.5 bg-primary/50"];

/** Pemutar audio; dengan `src` memutar berkas sungguhan, tanpa `src` hanya tampilan contoh. */
export function EntryAudio({ title, meta, src }: { title: string; meta: string; src?: string }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return setPlaying((p) => !p);
    if (audio.paused) void audio.play();
    else audio.pause();
  }

  return (
    <div className="flex w-full items-center justify-between gap-2 rounded-xl bg-surface-container-low p-3">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          aria-label={playing ? `Jeda ${title}` : `Putar ${title}`}
          onClick={toggle}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm transition-transform active:scale-95"
        >
          <Icon name={playing ? "pause" : "play_arrow"} size={20} />
        </button>
        <div className="flex min-w-0 flex-col">
          <span className="t-title-sm truncate text-on-surface">{title}</span>
          <span className="t-label-sm font-normal text-text-muted">{meta}</span>
        </div>
      </div>
      {src && (
        <audio
          ref={audioRef}
          src={src}
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
      )}
      <div aria-hidden="true" className="flex h-6 shrink-0 items-end gap-0.5 px-2">
        {BARS.map((b, i) => (
          <span key={i} className={`w-1 rounded-full ${b} ${playing ? "animate-pulse" : ""}`} />
        ))}
      </div>
    </div>
  );
}
