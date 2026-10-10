import type { Metadata } from "next";
import { RichText } from "@/components/rich-text";
import { notFound } from "next/navigation";
import { EntryAttachments } from "@/components/entry-attachments";
import { FocusHeader } from "@/components/focus-header";
import { Icon } from "@/components/icon";
import { PrintButton } from "@/components/print-button";
import { PrintPage } from "@/components/print-footer";
import { parseMood } from "@/lib/mood";
import { requireMemberPage } from "@/lib/server/session";
import { getEntry } from "@/server/member/journal";

type Params = Promise<{ id: string }>;

/** Judul halaman = tanggal jurnal, jadi nama berkas PDF hasil simpan ikut bermakna. */
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const user = await requireMemberPage();
  const entry = await getEntry(user.id, id);
  return { title: entry ? `Jurnal - ${entry.dateLabel}` : "Journal" };
}

export default async function JournalEntryPage({ params }: { params: Params }) {
  const { id } = await params;
  const user = await requireMemberPage();
  const entry = await getEntry(user.id, id);
  if (!entry) notFound();

  // Semua pertanyaan prompt tampil dengan jawabannya. Catatan Rasa hanya bila memang ditulis
  // (dan bukan salinan dari salah satu jawaban, seperti pada data lama).
  const answers = entry.answers;
  const note = answers.some((a) => a.value === entry.note) ? "" : entry.note;

  return (
    <>
      <FocusHeader title={entry.dayLabel} backHref="/journal" hideLogo />
      <PrintPage>
      <div className="mt-3 flex w-full flex-col gap-4 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="t-label-sm rounded-full bg-sage-tint px-2.5 py-0.5 font-semibold text-primary">
              {entry.dayLabel}
            </span>
            <span className="t-body-sm text-text-muted">{entry.dateLabel}</span>
          </div>
          <PrintButton />
        </div>

        <div className="flex flex-col gap-1">
          <span className="t-label-sm font-semibold tracking-wider text-primary uppercase">
            {entry.promptTitle ? "Prompt Harian" : "Tanpa Prompt"}
          </span>
          <h1 className="t-headline-sm leading-snug text-on-surface">
            {entry.promptTitle ? `“${entry.promptTitle}”` : "Jurnal Bebas"}
          </h1>
          {entry.promptSubtitle && <p className="t-body-md text-text-muted">{entry.promptSubtitle}</p>}
        </div>

        {answers.length > 0 && (
          <ol className="flex flex-col gap-3">
            {answers.map((a, i) => (
              <li key={`${i}-${a.label}`} className="flex flex-col gap-2 rounded-2xl bg-surface-container-low p-4">
                <div className="t-label-md flex gap-1.5 text-text-muted">
                  <span className="text-primary">{i + 1}.</span>
                  <RichText value={a.label} className="min-w-0 flex-1" />
                </div>
                <AnswerValue type={a.type} value={a.value} />
              </li>
            ))}
          </ol>
        )}

        {note && (
          <div className="flex flex-col gap-1">
            {entry.promptTitle && <span className="t-label-md text-text-muted">Catatan Rasa</span>}
            <p className="t-body-md leading-relaxed whitespace-pre-line text-on-surface-variant">{note}</p>
          </div>
        )}

        <EntryAttachments attachments={entry.attachments} />

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
      </PrintPage>
    </>
  );
}

/** Jawaban sesuai tipe pertanyaannya: mood (emoji + teks), skala (angka + bar), selain itu teks. */
function AnswerValue({ type, value }: { type: string; value: string }) {
  if (type === "mood") {
    const mood = parseMood(value);
    if (mood)
      return (
        <span className="t-title-sm flex items-center gap-2 text-on-surface">
          <span aria-hidden="true" className="text-2xl leading-none">
            {mood.emoji}
          </span>
          {mood.label}
        </span>
      );
  }
  if (type === "scale") {
    const m = /^(\d+)\s*\/\s*(\d+)$/.exec(value);
    if (m && Number(m[2]) > 0) {
      const pct = Math.min(100, (Number(m[1]) / Number(m[2])) * 100);
      return (
        <div className="flex items-center gap-3">
          <span className="t-title-sm text-on-surface">{value}</span>
          <div role="presentation" className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container-highest">
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
        </div>
      );
    }
  }
  return <span className="t-body-md leading-relaxed whitespace-pre-line text-on-surface">{value}</span>;
}
