import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EntryAudio } from "@/components/entry-audio";
import { EntryVideo } from "@/components/entry-video";
import { Icon } from "@/components/icon";
import { JournalTodayCard } from "@/components/journal-today-card";
import { MonthCalendar } from "@/components/month-calendar";
import { formatDateId } from "@/data/admin-prompts";
import type { MemberEntry } from "@/lib/journal-types";
import { requireMemberPage } from "@/lib/server/session";
import { todayWib } from "@/lib/server/time";
import { getPromptForDate } from "@/server/admin/prompts";
import { getMissedDates, listEntries } from "@/server/member/journal";

export const metadata: Metadata = { title: "Journal" };

export default async function JournalPage() {
  const user = await requireMemberPage();
  const today = todayWib();
  const missedDates = await getMissedDates(user.id);
  const activeDate = missedDates[0] ?? today;
  const [prompt, entries] = await Promise.all([getPromptForDate(activeDate), listEntries(user.id)]);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="mt-1 flex items-center gap-2">
        <Icon name="auto_stories" size={20} className="text-primary" />
        <h1 className="t-headline-sm text-on-surface">Jurnal Refleksi</h1>
      </div>
      <JournalTodayCard
        prompt={prompt}
        written={entries.some((e) => e.date === activeDate)}
        todayLabel={formatDateId(activeDate)}
        isToday={activeDate === today}
        missedCount={missedDates.length}
      />
      <MonthCalendar entries={entries} today={today} missedDates={missedDates} />
      <Feed entries={entries} />
    </div>
  );
}

function Feed({ entries }: { entries: MemberEntry[] }) {
  return (
    <>
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Icon name="history_edu" size={20} className="text-primary" />
          <h2 className="t-headline-sm text-on-surface">Riwayat Refleksi</h2>
        </div>
        <span className="t-label-sm rounded-full bg-surface-container-low px-2 py-0.5 font-normal text-text-muted">
          {entries.length} Entri Tersimpan
        </span>
      </div>
      {entries.length === 0 && (
        <p className="t-body-md rounded-2xl bg-surface-container-lowest p-4 text-text-muted shadow-sm">
          Belum ada jurnal. Tulis jurnal pertamamu hari ini.
        </p>
      )}
      {entries.map((e) => (
        <EntryCard key={e.id} entry={e} />
      ))}
    </>
  );
}

function EntryCard({ entry: e }: { entry: MemberEntry }) {
  return (
    <article className="flex w-full flex-col gap-2 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="t-body-sm text-text-muted">{e.dateLabel}</span>
        {e.feeling && (
          <span
            aria-label={`Perasaan: ${e.feeling.label}`}
            className="t-label-sm inline-flex items-center gap-1.5 rounded-full bg-secondary-container/55 px-2.5 py-1 font-medium text-on-secondary-container"
          >
            <span aria-hidden="true" className="text-base leading-none">
              {e.feeling.emoji}
            </span>
            {e.feeling.label}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <span className="t-label-sm font-semibold tracking-wider text-primary uppercase">
          {e.promptTitle ? "Prompt Harian" : "Tanpa Prompt"}
        </span>
        <h3 className="t-quote leading-snug text-on-surface">
          {e.promptTitle ? `“${e.promptTitle}”` : "Jurnal Bebas"}
        </h3>
      </div>

      <p className="t-body-md line-clamp-2 text-on-surface-variant">{e.excerpt}</p>

      {e.attachments.map((a) => (
        <Attachment key={a.id ?? `${a.kind}-${a.title}`} attachment={a} />
      ))}

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

function Attachment({ attachment: a }: { attachment: MemberEntry["attachments"][number] }) {
  if (a.kind === "image")
    return (
      <div className="relative h-36 w-full overflow-hidden rounded-xl shadow-inner">
        <Image unoptimized={!a.src.startsWith("/")} src={a.src} alt={a.title} fill sizes="(max-width: 480px) 100vw, 400px" className="object-cover" />
      </div>
    );
  if (a.kind === "video") return <EntryVideo src={a.src} poster={a.poster} title={a.title} compact />;
  return <EntryAudio title={a.title} meta={a.meta} src={a.src} />;
}
