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
    <div className="relative mx-auto aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-3xl bg-on-surface shadow-md">
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
          <span className="flex size-16 items-center justify-center rounded-full bg-surface/90 text-primary shadow-lg backdrop-blur-sm transition-transform active:scale-95">
            <Icon name="play_arrow" size={36} filled />
          </span>
        </button>
      )}
    </div>
  );
}
