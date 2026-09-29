import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ComingSoonButton } from "@/components/coming-soon-button";
import { EntryAudio } from "@/components/entry-audio";
import { Icon } from "@/components/icon";
import { JournalTabs } from "@/components/journal-tabs";
import { MonthCalendar } from "@/components/month-calendar";
import {
  JOURNAL_ENTRIES,
  PENDING_REFLECTION as P,
  type JournalEntry,
} from "@/data/member";

export const metadata: Metadata = { title: "Journal" };

export default function JournalPage() {
  return (
    <JournalTabs
      banners={<Banners />}
      calendar={<MonthCalendar />}
      pending={<PendingCard />}
      feed={<Feed />}
    />
  );
}

function Banners() {
  return (
    <>
      <div className="flex w-full items-start gap-2 rounded-2xl bg-surface-container-low p-4 shadow-sm">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
          <Icon name="event_repeat" size={18} />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="t-title-sm text-on-surface">Siklus Kelas: Sesi 2 Selesai</span>
            <span className="size-2 animate-pulse rounded-full bg-accent-coral" />
          </div>
          <p className="t-body-sm text-on-surface-variant">
            Tersisa 2 hari refleksi sebelum{" "}
            <strong className="text-tertiary">Sesi 3</strong> (Webinar Sabtu, 3 Okt
            2026, 19:30 WIB).
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-2 rounded-2xl bg-primary-container/15 p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
            <Icon name="insights" size={20} />
          </span>
          <div className="flex flex-col">
            <span className="t-title-sm text-on-surface">Laporan Pertumbuhan</span>
            <span className="t-body-sm text-text-muted">Komparasi Pre vs Post Session</span>
          </div>
        </div>
        <Link
          href="/profil#evaluasi"
          className="t-title-sm rounded-full bg-primary px-4 py-1.5 text-on-primary shadow-sm transition-all hover:opacity-90 active:scale-95"
        >
          Lihat
        </Link>
      </div>
    </>
  );
}

function PendingCard() {
  return (
    <div className="flex w-full items-center justify-between gap-2 rounded-2xl bg-surface-container p-4 shadow-sm">
      <div className="flex min-w-0 flex-col">
        <span className="t-label-sm font-semibold text-secondary uppercase">
          Tugas Refleksi Tertunda
        </span>
        <span className="t-title-sm truncate text-on-surface">
          Hari ke-{P.day} (27 Sep 2026)
        </span>
        <span className="t-body-sm text-text-muted">
          Isi untuk membuka jurnal hari ini
        </span>
      </div>
      <Link
        href="/journal/tulis"
        className="t-title-sm rounded-full bg-secondary px-4 py-2 whitespace-nowrap text-on-secondary shadow-sm transition-all hover:opacity-95 active:scale-95"
      >
        Lunasi Sekarang
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="t-label-sm rounded-full bg-sage-tint px-2.5 py-0.5 font-semibold text-primary">
            {e.dayLabel}
          </span>
          <span className="t-body-sm text-text-muted">{e.dateLabel}</span>
        </div>
        <ComingSoonButton
          feature="Menu entri"
          aria-label={`Menu opsi entri ${e.dayLabel}`}
          className="flex size-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-container-low"
        >
          <Icon name="more_horiz" size={18} />
        </ComingSoonButton>
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
        <ComingSoonButton
          feature="Riwayat versi"
          className="t-label-sm flex items-center gap-1 font-normal text-text-muted transition-colors hover:text-on-surface"
        >
          <span>{e.versionLabel}</span>
          <Icon name="history" size={14} />
        </ComingSoonButton>
      </div>
    </article>
  );
}
