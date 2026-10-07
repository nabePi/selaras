"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Icon } from "./icon";

type Poster = { key: string; url?: string };

/** Carousel poster: geser manual (swipe/scroll), tombol panah, dan penanda posisi bila lebih dari satu. */
export function PosterCarousel({ posters, title }: { posters: Poster[]; title: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const many = posters.length > 1;

  function go(to: number) {
    const el = track.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(posters.length - 1, to));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  }

  function onScroll() {
    const el = track.current;
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div className="relative" role="group" aria-roledescription="carousel" aria-label={`Poster ${title}`}>
      <ul
        ref={track}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-3xl bg-canvas-sand [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {posters.map((p, i) => (
          <li
            key={p.key}
            aria-roledescription="slide"
            aria-label={`${i + 1} dari ${posters.length}`}
            className="relative aspect-[3/4] max-h-[70dvh] w-full shrink-0 snap-center"
          >
            {p.url && (
              <Image
                src={p.url}
                alt={`Poster ${title} ${i + 1}`}
                fill
                unoptimized
                priority={i === 0}
                sizes="(max-width: 480px) 100vw, 480px"
                className="object-contain"
              />
            )}
          </li>
        ))}
      </ul>

      {many && (
        <>
          {(["prev", "next"] as const).map((dir) => {
            const disabled = dir === "prev" ? index === 0 : index === posters.length - 1;
            return (
              <button
                key={dir}
                type="button"
                aria-label={dir === "prev" ? "Poster sebelumnya" : "Poster berikutnya"}
                disabled={disabled}
                onClick={() => go(index + (dir === "prev" ? -1 : 1))}
                className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-surface/80 p-1.5 text-on-surface shadow-md backdrop-blur transition-opacity disabled:opacity-0 ${
                  dir === "prev" ? "left-2" : "right-2"
                }`}
              >
                <Icon name={dir === "prev" ? "chevron_left" : "chevron_right"} size={22} />
              </button>
            );
          })}
          <div className="mt-2 flex justify-center gap-1.5" aria-hidden="true">
            {posters.map((p, i) => (
              <span
                key={p.key}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-primary" : "w-1.5 bg-outline-variant"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
