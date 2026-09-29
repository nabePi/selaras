"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  FEATURED_STORY as F,
  STORIES,
  STORY_FILTERS,
  type Story,
  type StoryFilter,
} from "@/data/stories";
import { FilterPills } from "./filter-pills";
import { Icon } from "./icon";
import { LikeButton } from "./like-button";
import { MiniAudioPlayer } from "./mini-audio-player";

export function StoryFeed() {
  const [filter, setFilter] = useState<StoryFilter>("all");

  const showFeatured = filter === "all" || F.categories.includes(filter);
  const stories = STORIES.filter(
    (s) => filter === "all" || s.categories.includes(filter),
  );

  return (
    <>
      <FilterPills
        label="Filter kategori cerita"
        options={[...STORY_FILTERS]}
        value={filter}
        onChange={setFilter}
      />

      {showFeatured && (
        <section aria-label="Cerita Pilihan" className="mt-4 mb-6">
          <article className="flex flex-col gap-4 rounded-3xl bg-canvas-ivory p-5 shadow-[0_8px_24px_-4px_rgba(92,75,62,0.06)]">
            <div className="flex items-center justify-between">
              <span className="t-label-sm inline-flex items-center gap-1 rounded-full bg-sage-tint px-2.5 py-1 text-primary">
                <Icon name="auto_awesome" size={14} />
                Sorotan Bulan Ini
              </span>
              <span className="t-label-sm text-text-muted">{F.cohort}</span>
            </div>
            <div className="relative h-52 w-full overflow-hidden rounded-2xl bg-surface-container">
              <Image
                src={F.image}
                alt={F.imageAlt}
                fill
                sizes="(max-width: 480px) 100vw, 430px"
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-inverse-surface/60 via-transparent to-transparent p-4">
                <div className="flex items-center gap-2">
                  <Icon
                    name="favorite"
                    size={18}
                    filled
                    className="text-accent-sunray"
                  />
                  <span className="t-label-sm font-medium text-white">
                    {F.couple}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="t-headline-md leading-snug font-medium text-on-surface">
                {F.title}
              </h2>
              <div className="flex gap-3 rounded-2xl bg-surface-container-low/80 p-3.5">
                <div className="w-1 shrink-0 rounded-full bg-secondary" />
                <p className="t-quote leading-relaxed text-on-surface-variant italic">
                  “{F.quote}”
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="t-body-sm flex items-center gap-1.5 text-text-muted">
                <Icon name="schedule" size={16} />
                {F.readTime}
              </span>
              <button
                type="button"
                className="t-title-sm inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-primary transition-colors hover:bg-sage-tint hover:underline"
              >
                <span>Baca Cerita Lengkap</span>
                <Icon name="arrow_forward" size={16} />
              </button>
            </div>
          </article>
        </section>
      )}

      <section
        aria-label="Daftar Pengalaman Alumni"
        className="mt-4 mb-6 flex flex-col gap-4"
      >
        <div className="flex items-center justify-between px-1">
          <h2 className="t-headline-sm text-on-surface">
            Kisah dari Ruang Tamu Pasutri
          </h2>
          <span className="t-label-sm font-semibold text-primary">
            12 Cerita Baru
          </span>
        </div>
        {stories.length === 0 ? (
          <p className="t-body-md rounded-2xl bg-surface-container-low p-4 text-center text-text-muted">
            Belum ada cerita di kategori ini.
          </p>
        ) : (
          stories.map((s) => <StoryCard key={s.id} story={s} />)
        )}
      </section>
    </>
  );
}

function StoryCard({ story: s }: { story: Story }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-[0_4px_16px_rgba(92,75,62,0.04)]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Image
            src={s.image}
            alt={s.couple}
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-full bg-surface-container object-cover"
          />
          <div className="flex flex-col">
            <h3 className="t-title-sm text-on-surface">{s.couple}</h3>
            <span className="t-body-sm text-text-muted">{s.meta}</span>
          </div>
        </div>
        <span
          className={`t-label-sm shrink-0 rounded-full px-2.5 py-0.5 ${s.badgeTone}`}
        >
          {s.badge}
        </span>
      </div>
      <h4 className="t-title-md leading-snug font-semibold text-on-surface">
        {s.title}
      </h4>
      {s.audio && (
        <MiniAudioPlayer title={s.audio.title} duration={s.audio.duration} />
      )}
      <p className="t-body-md line-clamp-2 text-on-surface-variant">
        {s.excerpt}
      </p>
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <LikeButton initial={s.likes} />
          <span aria-hidden="true" className="text-[10px] text-text-muted">
            •
          </span>
          <span className="t-body-sm text-text-muted">{s.footnote}</span>
        </div>
        <Link
          href="/cerita"
          className="t-label-sm flex items-center gap-0.5 font-medium text-primary"
        >
          Selengkapnya <Icon name="chevron_right" size={14} />
        </Link>
      </div>
    </article>
  );
}
