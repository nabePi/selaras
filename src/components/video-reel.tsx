"use client";

import { useRef, useState } from "react";
import { Icon } from "./icon";

type Props = {
  src: string;
  poster: string;
  title: string;
};

/** Video portrait 9:16 ala reels: dimuat saat diketuk, diputar dengan suara. */
export function VideoReel({ src, poster, title }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[320px] rounded-[2rem] bg-gradient-to-b from-tertiary-fixed to-canvas-sand p-2.5 shadow-[0_10px_30px_rgba(113,86,68,0.25)] ring-1 ring-tertiary/20">
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-3xl bg-on-surface ring-1 ring-tertiary/30">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          title={title}
          preload="none"
          playsInline
          controls={started}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setStarted(false)}
          className="size-full object-cover"
        />
        {!playing && (
          <button
            type="button"
            aria-label={`Putar video: ${title}`}
            onClick={() => {
              setStarted(true);
              void videoRef.current?.play();
            }}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-on-surface/50 via-transparent to-transparent"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-tertiary text-on-tertiary shadow-lg ring-4 ring-surface/60 transition-transform active:scale-95">
              <Icon name="play_arrow" size={36} filled />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
