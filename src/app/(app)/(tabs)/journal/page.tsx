import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EntryAudio } from "@/components/entry-audio";
import { Icon } from "@/components/icon";
import { MonthCalendar } from "@/components/month-calendar";
import {
  JOURNAL_ENTRIES,
  PENDING_REFLECTION as P,
  type JournalEntry,
} from "@/data/member";

export const metadata: Metadata = { title: "Journal" };

export default function JournalPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="mt-1 flex items-center gap-2">
        <Icon name="auto_stories" size={20} className="text-primary" />
        <h1 className="t-headline-sm text-on-surface">Jurnal Refleksi</h1>
      </div>
      <WriteCard />
      <MonthCalendar />
      <Feed />
    </div>
  );
}

function WriteCard() {
  return (
    <div className="flex flex-col gap-4 rounded-4xl bg-surface-container-low p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="size-2.5 animate-pulse rounded-full bg-accent-coral" />
          <span className="t-label-sm font-semibold tracking-wider text-secondary uppercase">
            Sesi {P.session} • Hari ke-{P.day} (Tertunda)
          </span>
        </div>
        <span className="t-label-sm rounded-full bg-surface-container-highest px-2.5 py-0.5 font-medium text-tertiary">
          ~{P.minutes} Menit
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="t-headline-sm leading-snug text-on-surface">{P.teaser}</h2>
        <p className="t-body-sm text-text-muted">{P.teaserNote}</p>
      </div>
      <Link
        href="/journal/tulis"
        className="t-title-sm flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 tracking-wide text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-[0.99]"
      >
        <span>Tulis Jurnal Sekarang</span>
        <Icon name="arrow_forward" size={18} />
      </Link>
    </div>
  );
}

function Feed() {
  return (
    <>
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Icon name="history_edu" size={20} className="text-primary" />
          <h2 className="t-headline-sm text-on-surface">Riwayat Refleksi</h2>
        </div>
        <span className="t-label-sm rounded-full bg-surface-container-low px-2 py-0.5 font-normal text-text-muted">
          {JOURNAL_ENTRIES.length} Entri Tersimpan
        </span>
      </div>
      {JOURNAL_ENTRIES.map((e) => (
        <EntryCard key={e.id} entry={e} />
      ))}
    </>
  );
}

function EntryCard({ entry: e }: { entry: JournalEntry }) {
  return (
    <article className="flex w-full flex-col gap-2 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="t-label-sm rounded-full bg-sage-tint px-2.5 py-0.5 font-semibold text-primary">
            {e.dayLabel}
          </span>
          <span className="t-body-sm text-text-muted">{e.dateLabel}</span>
        </div>
        <span
          aria-label={`Perasaan: ${e.feeling.label}`}
          className="t-label-sm inline-flex items-center gap-1.5 rounded-full bg-secondary-container/55 px-2.5 py-1 font-medium text-on-secondary-container"
        >
          <span aria-hidden="true" className="text-base leading-none">
            {e.feeling.emoji}
          </span>
          {e.feeling.label}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="t-label-sm font-semibold tracking-wider text-primary uppercase">
          Prompt Harian
        </span>
        <h3 className="t-quote leading-snug text-on-surface">“{e.prompt}”</h3>
      </div>

      <p className="t-body-md line-clamp-2 text-on-surface-variant">{e.excerpt}</p>

      {e.photo && (
        <div className="relative h-36 w-full overflow-hidden rounded-xl shadow-inner">
          <Image
            src={e.photo.src}
            alt={e.photo.alt}
            fill
            sizes="(max-width: 480px) 100vw, 400px"
            className="object-cover"
          />
          <div className="t-label-sm absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-inverse-surface/70 px-2 py-1 text-inverse-on-surface backdrop-blur-sm">
            <Icon name="photo_camera" size={14} />
            <span>{e.photo.caption}</span>
          </div>
        </div>
      )}
      {e.audio && <EntryAudio title={e.audio.title} meta={e.audio.meta} />}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-surface-container-low pt-2">
        {e.shared ? (
          <span className="t-label-sm flex items-center gap-1 rounded-full bg-accent-mint/30 px-2 py-0.5 text-primary">
            <Icon name="verified_user" size={13} />
            Dibagikan ke Coach
          </span>
        ) : (
          <span className="t-label-sm flex items-center gap-1 rounded-full bg-surface-container px-2 py-0.5 text-tertiary">
            <Icon name="lock" size={13} />
            Privat (Catatan Pribadi)
          </span>
        )}
        <Link
          href={`/journal/${e.id}`}
          aria-label={`Lihat detail ${e.dayLabel}, ${e.dateLabel}`}
          className="t-title-sm flex items-center gap-1.5 rounded-full px-2 py-1 text-primary transition-colors hover:bg-sage-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span>Lihat Detail</span>
          <Icon name="arrow_forward" size={15} />
        </Link>
      </div>
    </article>
  );
}
