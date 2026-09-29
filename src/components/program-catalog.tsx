"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  FEATURED_PROGRAM as F,
  OTHER_PROGRAMS,
  PROGRAM_FILTERS,
  type OtherProgram,
  type ProgramFilter,
} from "@/data/programs";
import { FilterPills } from "./filter-pills";
import { Icon } from "./icon";

export function ProgramCatalog() {
  const [filter, setFilter] = useState<ProgramFilter>("all");

  const showFeatured = filter === "all" || F.categories.includes(filter);
  const others = OTHER_PROGRAMS.filter(
    (p) => filter === "all" || p.categories.includes(filter),
  );

  return (
    <>
      <section className="flex flex-col pb-6">
        <FilterPills
          label="Filter kategori program"
          options={[...PROGRAM_FILTERS]}
          value={filter}
          onChange={setFilter}
        />
      </section>

      {showFeatured && (
        <section className="flex flex-col pb-8">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="t-title-md font-semibold text-on-surface">
              Cohort Utama Terdekat
            </h2>
            <span className="t-label-sm flex items-center gap-1 font-medium text-primary">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              Sisa {F.slotsLeft} Slot
            </span>
          </div>

          <article className="flex flex-col overflow-hidden rounded-3xl bg-canvas-ivory shadow-sm">
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src="/images/program-cohort.jpg"
                alt="Pasangan muslim berbincang hangat dengan teh di meja kayu yang terkena cahaya matahari"
                fill
                sizes="(max-width: 480px) 100vw, 440px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-canvas-ivory via-transparent to-black/20" />
              <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
                <span className="t-label-sm flex items-center gap-1 rounded-full bg-surface/90 px-3 py-1 font-semibold text-primary shadow-sm backdrop-blur-md">
                  <Icon name="event_available" size={14} /> {F.startLabel}
                </span>
                <span className="t-label-sm rounded-full bg-secondary-container/90 px-3 py-1 font-medium text-on-secondary-container shadow-sm backdrop-blur-md">
                  {F.cohort}
                </span>
              </div>
            </div>

            <div className="relative -mt-4 flex flex-col rounded-t-3xl bg-canvas-ivory p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="t-label-sm rounded-full bg-sage-tint px-2.5 py-0.5 font-semibold text-primary">
                  {F.duration}
                </span>
                <span className="t-body-sm text-text-muted">• {F.format}</span>
              </div>
              <h3 className="t-headline-sm mb-2 font-medium text-on-surface">
                {F.title}
              </h3>
              <p className="t-body-md mb-4 leading-relaxed text-text-muted">
                {F.description}
              </p>

              <div className="mb-4 flex flex-col gap-2.5 rounded-2xl bg-surface p-3.5">
                <span className="t-title-sm flex items-center gap-1.5 font-semibold text-on-surface">
                  <Icon name="menu_book" size={18} className="text-primary" />
                  Cuplikan 3 Sesi Utama
                </span>
                <ol className="t-body-sm flex flex-col gap-2 text-text-muted">
                  {F.sessions.map((s, i) => (
                    <li key={s} className="flex items-start gap-2">
                      <span className="t-label-sm mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-sage-tint font-bold text-primary">
                        {i + 1}
                      </span>
                      <span>
                        <strong className="font-medium text-on-surface">
                          Sesi {i + 1}:
                        </strong>{" "}
                        {s}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-2">
                <ValueChip
                  icon="assignment_turned_in"
                  iconTone="text-primary"
                  title="Pre-Post Test"
                  caption="30 Indikator Harmoni"
                />
                <ValueChip
                  icon="mark_chat_read"
                  iconTone="text-secondary"
                  title="1-on-1 Feedback"
                  caption="Review Jurnal Psikolog"
                />
              </div>

              <div className="flex flex-col gap-3 pt-3">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="t-label-sm text-text-muted">
                      Investasi untuk Berdua (Pasangan)
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="t-title-lg font-bold text-primary">
                        {F.price}
                      </span>
                      <span className="t-body-sm text-text-muted line-through">
                        {F.originalPrice}
                      </span>
                    </div>
                  </div>
                  <span className="t-label-sm rounded-full bg-accent-mint/40 px-2.5 py-1 text-center font-semibold text-primary">
                    Tersedia Kuota Beasiswa
                  </span>
                </div>
                <div className="flex flex-col gap-2.5 pt-1">
                  <Link
                    href="/daftar"
                    className="t-title-sm flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-[0.98]"
                  >
                    <span>Daftar {F.cohort}</span>
                    <Icon name="arrow_forward" size={18} />
                  </Link>
                  <button
                    type="button"
                    className="t-title-sm flex min-h-11 items-center justify-center gap-2 rounded-full bg-surface px-4 py-3 text-on-surface shadow-sm transition-colors hover:bg-surface-container-low"
                  >
                    <Icon name="download" size={18} className="text-primary" />
                    <span>Silabus PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        </section>
      )}

      <section className="flex flex-col pb-8">
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="t-title-md font-semibold text-on-surface">
            Program Lainnya
          </h2>
          <span className="t-body-sm text-text-muted">Koleksi Terjadwal</span>
        </div>
        {others.length === 0 ? (
          <p className="t-body-md rounded-2xl bg-surface-container-low p-4 text-center text-text-muted">
            Belum ada program lain di kategori ini. Segera hadir!
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {others.map((p) => (
              <li key={p.id}>
                <OtherProgramCard program={p} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function ValueChip({
  icon,
  iconTone,
  title,
  caption,
}: {
  icon: string;
  iconTone: string;
  title: string;
  caption: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-surface-container-low p-2.5">
      <Icon name={icon} size={20} className={iconTone} />
      <div className="flex flex-col">
        <span className="t-label-sm font-semibold text-on-surface">{title}</span>
        <span className="t-body-sm text-text-muted">{caption}</span>
      </div>
    </div>
  );
}

function OtherProgramCard({ program: p }: { program: OtherProgram }) {
  return (
    <article
      className={`flex flex-col gap-3 rounded-3xl bg-surface-container-low p-4 shadow-sm ${
        p.kind === "soon" ? "opacity-90" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <span
            className={`t-label-sm mb-1.5 w-fit rounded-full px-2.5 py-0.5 font-medium ${p.tagTone}`}
          >
            {p.tag}
          </span>
          <h3 className="t-title-md font-semibold text-on-surface">{p.title}</h3>
        </div>
        <span
          className={`t-label-sm shrink-0 rounded-full px-2.5 py-1 shadow-xs ${p.statusTone}`}
        >
          {p.status}
        </span>
      </div>
      <p className="t-body-sm text-text-muted">{p.description}</p>
      <div className="flex items-center justify-between gap-2 pt-2">
        {p.kind === "waitlist" && (
          <>
            <span className="t-body-sm flex items-center gap-1.5 text-text-muted">
              <Icon name="schedule" size={16} />
              {p.meta}
            </span>
            <button
              type="button"
              className="t-title-sm rounded-full bg-surface px-4 py-1.5 text-primary shadow-xs transition-colors hover:bg-sage-tint"
            >
              Gabung Waiting List
            </button>
          </>
        )}
        {p.kind === "selfpaced" && (
          <>
            <span className="t-title-sm font-bold text-primary">{p.meta}</span>
            <button
              type="button"
              className="t-title-sm rounded-full bg-primary px-4 py-1.5 text-on-primary shadow-sm transition-all active:scale-95"
            >
              Mulai Sekarang
            </button>
          </>
        )}
        {p.kind === "soon" && (
          <>
            <span className="t-body-sm text-text-muted">{p.meta}</span>
            <button
              type="button"
              disabled
              className="t-title-sm shrink-0 cursor-not-allowed rounded-full bg-surface-container px-3.5 py-1.5 text-text-muted"
            >
              Ingatkan Saya
            </button>
          </>
        )}
      </div>
    </article>
  );
}
