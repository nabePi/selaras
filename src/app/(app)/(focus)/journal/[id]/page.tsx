import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { EntryAudio } from "@/components/entry-audio";
import { EntryVideo } from "@/components/entry-video";
import { FocusHeader } from "@/components/focus-header";
import { Icon } from "@/components/icon";
import { requireMemberPage } from "@/lib/server/session";
import { getEntry } from "@/server/member/journal";

type Params = Promise<{ id: string }>;

export const metadata: Metadata = { title: "Journal" };

export default async function JournalEntryPage({ params }: { params: Params }) {
  const { id } = await params;
  const user = await requireMemberPage();
  const entry = await getEntry(user.id, id);
  if (!entry) notFound();

  // Catatan Rasa sudah menjadi `content`; jawaban prompt ditampilkan terpisah.
  const answers = entry.answers.filter((a) => !(a.type === "text" && a.value === entry.content));

  return (
    <>
      <FocusHeader title={entry.dayLabel} backHref="/journal" hideLogo />
      <div className="mt-3 flex w-full flex-col gap-4 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="t-label-sm rounded-full bg-sage-tint px-2.5 py-0.5 font-semibold text-primary">
              {entry.dayLabel}
            </span>
            <span className="t-body-sm text-text-muted">{entry.dateLabel}</span>
          </div>
          {entry.feeling && (
            <span
              aria-label={`Perasaan: ${entry.feeling.label}`}
              className="t-label-sm inline-flex items-center gap-1.5 rounded-full bg-secondary-container/55 px-2.5 py-1 font-medium text-on-secondary-container"
            >
              <span aria-hidden="true" className="text-base leading-none">
                {entry.feeling.emoji}
              </span>
              {entry.feeling.label}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <span className="t-label-sm font-semibold tracking-wider text-primary uppercase">
            {entry.promptTitle ? "Prompt Harian" : "Tanpa Prompt"}
          </span>
          <h1 className="t-headline-sm leading-snug text-on-surface">
            {entry.promptTitle ? `“${entry.promptTitle}”` : "Jurnal Bebas"}
          </h1>
        </div>

        {answers.length > 0 && (
          <ol className="flex flex-col gap-3">
            {answers.map((a) => (
              <li key={a.label} className="flex flex-col gap-1 rounded-2xl bg-surface-container-low p-4">
                <span className="t-label-md text-text-muted">{a.label}</span>
                <span className="t-body-md text-on-surface">{a.value}</span>
              </li>
            ))}
          </ol>
        )}

        {entry.attachments.map((a) => {
          if (a.kind === "image")
            return (
              <div key={a.id ?? a.title} className="relative h-52 w-full overflow-hidden rounded-2xl shadow-inner">
                <Image unoptimized={!a.src.startsWith("/")} src={a.src} alt={a.title} fill sizes="(max-width: 480px) 100vw, 440px" className="object-cover" />
              </div>
            );
          if (a.kind === "video") return <EntryVideo key={a.id ?? a.title} src={a.src} poster={a.poster} title={a.title} />;
          return <EntryAudio key={a.id ?? a.title} title={a.title} meta={a.meta} src={a.src} />;
        })}

        {entry.content && (
          <p className="t-body-md leading-relaxed whitespace-pre-line text-on-surface-variant">{entry.content}</p>
        )}

        <div className="flex items-center border-t border-surface-container-low pt-3">
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
        </div>
      </div>
    </>
  );
}
