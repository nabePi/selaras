import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { EntryAudio } from "@/components/entry-audio";
import { FocusHeader } from "@/components/focus-header";
import { Icon } from "@/components/icon";
import { JOURNAL_ENTRIES } from "@/data/member";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const entry = JOURNAL_ENTRIES.find((e) => e.id === id);
  return { title: entry ? `${entry.dayLabel} · Journal` : "Journal" };
}

export default async function JournalEntryPage({ params }: { params: Params }) {
  const { id } = await params;
  const entry = JOURNAL_ENTRIES.find((e) => e.id === id);
  if (!entry) notFound();

  return (
    <>
      <FocusHeader title={entry.dayLabel} backHref="/journal" hideLogo />
      <div className="mt-3 flex w-full flex-col gap-4 pb-10">
        <div className="flex items-center gap-2">
          <span className="t-label-sm rounded-full bg-sage-tint px-2.5 py-0.5 font-semibold text-primary">
            {entry.dayLabel}
          </span>
          <span className="t-body-sm text-text-muted">{entry.dateLabel}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="t-label-sm font-semibold tracking-wider text-primary uppercase">
            Prompt Harian
          </span>
          <h1 className="t-headline-sm leading-snug text-on-surface">“{entry.prompt}”</h1>
        </div>

        {entry.photo && (
          <div className="relative h-52 w-full overflow-hidden rounded-2xl shadow-inner">
            <Image
              src={entry.photo.src}
              alt={entry.photo.alt}
              fill
              sizes="(max-width: 480px) 100vw, 440px"
              className="object-cover"
            />
            <div className="t-label-sm absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-inverse-surface/70 px-2 py-1 text-inverse-on-surface backdrop-blur-sm">
              <Icon name="photo_camera" size={14} />
              <span>{entry.photo.caption}</span>
            </div>
          </div>
        )}
        {entry.audio && <EntryAudio title={entry.audio.title} meta={entry.audio.meta} />}

        <p className="t-body-md leading-relaxed text-on-surface-variant">{entry.content}</p>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-surface-container-low pt-3">
          {entry.shared ? (
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
          <span className="t-label-sm text-text-muted">{entry.versionLabel}</span>
        </div>
      </div>
    </>
  );
}
